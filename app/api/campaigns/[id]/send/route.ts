/**
 * API Route: POST /api/campaigns/[id]/send
 * Sends campaign emails to selected participants
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getCampaignById,
  updateCampaign,
  updateCampaignStats,
} from '@/lib/services/campaigns';
import {
  getAllParticipants,
  getParticipantsByTags,
  getParticipantsByIds,
} from '@/lib/services/participants';
import { sendCampaignEmail, delay } from '@/lib/aws/ses';
import { replaceTags, getTagReplacements } from '@/lib/utils/email-tags';
import { getParticipantById } from '@/lib/services/participants';
import type { CampaignFilters } from '@/lib/models/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaña no encontrada' },
        { status: 404 }
      );
    }

    // Update status to sending
    await updateCampaign(campaignId, { status: 'sending' });

    // Resolve recipients based on filters
    let recipients: Array<{ email: string; id: string }> = [];
    const filters = campaign.filters as CampaignFilters | undefined;

    if (filters?.allParticipants) {
      // Send to all participants
      const all = await getAllParticipants();
      recipients = all.map((p) => ({ email: p.email, id: p.id }));
    } else if (filters?.participantIds && filters.participantIds.length > 0) {
      // Send to specific participant IDs
      const selected = await getParticipantsByIds(filters.participantIds);
      recipients = selected.map((p) => ({ email: p.email, id: p.id }));
    } else if (filters?.tags && filters.tags.length > 0) {
      // Send to participants with specific tags
      const tagged = await getParticipantsByTags(filters.tags);
      recipients = tagged.map((p) => ({ email: p.email, id: p.id }));
    }

    const totalRecipients = recipients.length;
    let sentCount = 0;
    let failedCount = 0;

    // Send emails with throttling and tag replacement
    for (const recipient of recipients) {
      try {
        // Get participant data for tag replacement
        const participant = await getParticipantById(recipient.id);
        const tagReplacements = participant 
          ? getTagReplacements(participant)
          : {
              nombre: recipient.email.split('@')[0],
              primerNombre: recipient.email.split('@')[0],
              apellido: '',
              email: recipient.email,
              telefono: '',
              ciudad: '',
            };

        // Replace tags in subject and body
        const processedSubject = replaceTags(campaign.subject, tagReplacements);
        const processedBodyHtml = replaceTags(campaign.bodyHtml, tagReplacements);

        const result = await sendCampaignEmail(
          recipient.email,
          processedSubject,
          processedBodyHtml
        );

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
          console.error(`Failed to send to ${recipient.email}:`, result.error);
        }

        // Throttle: wait 100ms between sends to avoid SES rate limits
        await delay(100);
      } catch (error: any) {
        failedCount++;
        console.error(`Error sending to ${recipient.email}:`, error);
      }
    }

    // Update campaign status
    const finalStatus = failedCount === totalRecipients ? 'failed' : 'sent';
    await updateCampaign(campaignId, { status: finalStatus });

    // Update campaign statistics
    await updateCampaignStats(campaignId, {
      totalRecipients,
      sentCount,
      failedCount,
      lastRunAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRecipients,
        sentCount,
        failedCount,
      },
    });
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    
    // Update campaign status to failed
    try {
      const { id } = await params;
      await updateCampaign(id, { status: 'failed' });
    } catch (updateError) {
      console.error('Error updating campaign status:', updateError);
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Error al enviar campaña' },
      { status: 500 }
    );
  }
}


