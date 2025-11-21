#!/usr/bin/env node
/**
 * Script para probar el envío de magic link directamente
 * Útil para debugging cuando el endpoint de Amplify falla
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { v4 as uuidv4 } from "uuid";

const REGION = process.env.REGION || "us-east-1";
const USERS_TABLE = process.env.CRM_USERS_TABLE || "CRM-Users";
const FROM_EMAIL = process.env.SES_FROM_EMAIL || "doce25@precotracks.org";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://main.d2iig4dsutc1x0.amplifyapp.com";

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: REGION });

async function testMagicLink(email) {
  console.log(`🧪 Probando magic link para: ${email}\n`);

  // 1. Verificar usuario en DynamoDB
  console.log("1️⃣ Verificando usuario en DynamoDB...");
  try {
    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          pk: `USER#${email.toLowerCase()}`,
          sk: "META",
        },
      })
    );

    if (!userResult.Item) {
      console.error("❌ Usuario no encontrado en DynamoDB");
      console.log(`   Buscando: USER#${email.toLowerCase()}`);
      return;
    }

    console.log("✅ Usuario encontrado:");
    console.log(`   Email: ${userResult.Item.email}`);
    console.log(`   Nombre: ${userResult.Item.name}`);
    console.log(`   Rol: ${userResult.Item.role}`);
    console.log(`   Activo: ${userResult.Item.isActive}\n`);
  } catch (error) {
    console.error("❌ Error accediendo DynamoDB:", error.message);
    console.error("   Verifica permisos IAM y que la tabla exista");
    return;
  }

  // 2. Crear token de magic link
  console.log("2️⃣ Creando token de magic link...");
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  try {
    await docClient.send(
      new (await import("@aws-sdk/lib-dynamodb")).PutCommand({
        TableName: USERS_TABLE,
        Item: {
          pk: `MAGIC#${token}`,
          sk: "SESSION",
          email: email.toLowerCase(),
          token,
          expiresAt,
          used: false,
          createdAt: new Date().toISOString(),
        },
      })
    );
    console.log("✅ Token creado en DynamoDB");
    console.log(`   Token: ${token.substring(0, 8)}...\n`);
  } catch (error) {
    console.error("❌ Error creando token:", error.message);
    return;
  }

  // 3. Enviar email via SES
  console.log("3️⃣ Enviando email via SES...");
  const magicLink = `${APP_URL}/auth/verify?token=${token}`;

  try {
    const emailCommand = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Tu enlace de acceso a PrecoTracks CRM",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `Hola,\n\nHaz clic en el siguiente enlace para acceder a PrecoTracks CRM:\n\n${magicLink}\n\nEste enlace expira en 30 minutos.\n\nSi no solicitaste este acceso, ignora este email.\n\nSaludos,\nEquipo PrecoTracks`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2>Acceso a PrecoTracks CRM</h2>
                  <p>Haz clic en el siguiente enlace para acceder:</p>
                  <p><a href="${magicLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acceder al CRM</a></p>
                  <p style="color: #666; font-size: 12px;">Este enlace expira en 30 minutos.</p>
                  <p style="color: #666; font-size: 12px;">Si no solicitaste este acceso, ignora este email.</p>
                </body>
              </html>
            `,
            Charset: "UTF-8",
          },
        },
      },
    });

    const result = await sesClient.send(emailCommand);
    console.log("✅ Email enviado exitosamente!");
    console.log(`   Message ID: ${result.MessageId}`);
    console.log(`   Magic Link: ${magicLink}\n`);
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
    console.error(`   Code: ${error.name || error.code}`);
    if (error.message.includes("Email address not verified")) {
      console.error("   ⚠️  El email de destino necesita estar verificado (solo en sandbox)");
    }
    if (error.message.includes("AccessDenied")) {
      console.error("   ⚠️  Verifica permisos IAM para SES");
    }
    return;
  }

  console.log("✅ ¡Prueba completada exitosamente!");
  console.log(`\n📧 Revisa el email en: ${email}`);
  console.log(`🔗 O usa este enlace directo: ${magicLink}`);
}

// Ejecutar
const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/test-magic-link.mjs <email>");
  console.error("Ejemplo: node scripts/test-magic-link.mjs enrique@edgardohernandez.com");
  process.exit(1);
}

testMagicLink(email).catch(console.error);

