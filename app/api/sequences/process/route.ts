/**
 * API Route: POST /api/sequences/process
 * Process sequences and send emails that are due
 * This should be called periodically (e.g., via cron job or scheduled Lambda)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  listSequences,
  getSequenceById,
  getParticipantsReadyForNextStep,
  updateParticipantProgress,
  completeParticipantSequence,
} from '@/lib/services/sequences';
import { getParticipantById } from '@/lib/services/participants';
import { sendCampaignEmail, delay } from '@/lib/aws/ses';
import { replaceTags, getTagReplacements } from '@/lib/utils/email-tags';

export async function POST(request: NextRequest) {
  try {
    // Optional: Require API key or secret for security
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.SEQUENCE_PROCESS_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const activeSequences = (await listSequences()).filter(
      (s) => s.status === 'active'
    );

    let totalSent = 0;
    let totalFailed = 0;

    for (const sequence of activeSequences) {
      try {
        // Get participants ready for next step
        const readyParticipants = await getParticipantsReadyForNextStep(sequence.id);

        for (const progress of readyParticipants) {
          try {
            const participant = await getParticipantById(progress.participantId);
            if (!participant) {
              console.error(`Participant ${progress.participantId} not found`);
              continue;
            }

            // Get current step
            const currentStepIndex = progress.currentStep - 1;
            const step = sequence.steps[currentStepIndex];

            if (!step) {
              // Sequence completed
              await completeParticipantSequence(sequence.id, progress.participantId);
              continue;
            }

            // Replace tags with participant data
            const tagReplacements = getTagReplacements(participant);
            const processedSubject = replaceTags(step.subject, tagReplacements);
            const processedBodyHtml = replaceTags(step.bodyHtml, tagReplacements);

            // Send email
            const result = await sendCampaignEmail(
              participant.email,
              processedSubject,
              processedBodyHtml
            );

            if (result.success) {
              totalSent++;

              // Calculate next send date
              const nextStepIndex = currentStepIndex + 1;
              const nextStep = sequence.steps[nextStepIndex];

              if (nextStep) {
                // Calculate delay for next step
                const delayMs =
                  (nextStep.delayDays * 24 * 60 * 60 * 1000) +
                  ((nextStep.delayHours || 0) * 60 * 60 * 1000);
                const nextSendDate = new Date(Date.now() + delayMs);

                await updateParticipantProgress(
                  sequence.id,
                  progress.participantId,
                  nextStepIndex + 1,
                  nextSendDate
                );
              } else {
                // Sequence completed
                await completeParticipantSequence(sequence.id, progress.participantId);
              }
            } else {
              totalFailed++;
              console.error(`Failed to send email to ${participant.email}:`, result.error);
            }

            // Throttle to avoid SES rate limits
            await delay(100);
          } catch (error: any) {
            totalFailed++;
            console.error(`Error processing participant ${progress.participantId}:`, error);
          }
        }
      } catch (error: any) {
        console.error(`Error processing sequence ${sequence.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sequencesProcessed: activeSequences.length,
        emailsSent: totalSent,
        emailsFailed: totalFailed,
      },
    });
  } catch (error: any) {
    console.error('Error processing sequences:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar secuencias' },
      { status: 500 }
    );
  }
}

