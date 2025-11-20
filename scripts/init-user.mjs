#!/usr/bin/env node
/**
 * Script para inicializar usuarios en la whitelist de CRM
 * Uso: node scripts/init-user.mjs <email> [name] [role]
 * Ejemplo: node scripts/init-user.mjs admin@precotracks.org "Admin User" admin
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.CRM_USERS_TABLE || "CRM-Users";

async function createUser(email, name, role = "admin") {
  const timestamp = new Date().toISOString();
  
  const user = {
    pk: `USER#${email.toLowerCase()}`,
    sk: "META",
    email: email.toLowerCase(),
    name: name || email.split("@")[0],
    role: role === "admin" || role === "staff" ? role : "admin",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  console.log(`📝 Creando usuario: ${email}...`);

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    })
  );

  console.log(`✅ Usuario creado exitosamente!`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Nombre: ${user.name}`);
  console.log(`   Rol: ${user.role}`);
  console.log(`   Activo: ${user.isActive}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Uso: node scripts/init-user.mjs <email> [name] [role]");
    console.log("Ejemplo: node scripts/init-user.mjs admin@precotracks.org \"Admin User\" admin");
    process.exit(1);
  }

  const [email, name, role] = args;

  if (!email || !email.includes("@")) {
    console.error("❌ Email inválido");
    process.exit(1);
  }

  try {
    await createUser(email, name, role);
  } catch (error) {
    console.error("❌ Error creando usuario:", error.message);
    process.exit(1);
  }
}

main();

