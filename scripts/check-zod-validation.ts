/**
 * Script de vérification des validations Zod
 *
 * Vérifie que toutes les procédures tRPC ont une validation des inputs
 */

import { appRouter } from '../server/routers';
import type { Procedure } from '@trpc/server';
import type { z } from 'zod';

interface ProcedureInfo {
  path: string;
  hasInput: boolean;
  hasPublicAccess: boolean;
  mutation: boolean;
}

function checkProcedure(path: string, procedure: any): ProcedureInfo {
  const isPublic = procedure._def.type === 'query' || procedure._def.type === 'mutation';
  const hasInput = procedure._def.inputs && procedure._def.inputs.length > 0;
  const isMutation = procedure._def.type === 'mutation';

  return {
    path,
    hasInput,
    hasPublicAccess: isPublic,
    mutation: isMutation,
  };
}

function extractProcedures(router: any, path: string = ''): ProcedureInfo[] {
  const procedures: ProcedureInfo[] = [];

  for (const [key, value] of Object.entries(router._def.procedures)) {
    const fullPath = path ? `${path}.${key}` : key;
    procedures.push(checkProcedure(fullPath, value as Procedure));
  }

  for (const [key, value] of Object.entries(router._def.router)) {
    const fullPath = path ? `${path}.${key}` : key;
    procedures.push(...extractProcedures(value, fullPath));
  }

  return procedures;
}

function main() {
  console.log('🔍 Vérification des validations Zod...\n');

  const procedures = extractProcedures(appRouter);
  
  const publicProcedures = procedures.filter(p => p.hasPublicAccess);
  const proceduresWithoutInput = publicProcedures.filter(p => !p.hasInput);
  
  // Procédures publiques sans input (potentiellement vulnérables)
  const vulnerableProcedures = proceduresWithoutInput.filter(p => p.mutation);

  console.log(`📊 Statistiques :
`);
  console.log(`  Total procédures : ${procedures.length}`);
  console.log(`  Procédures publiques : ${publicProcedures.length}`);
  console.log(`  Sans validation input : ${proceduresWithoutInput.length}`);
  console.log(`  Mutations sans input : ${vulnerableProcedures.length}\n`);

  if (vulnerableProcedures.length > 0) {
    console.log('⚠️  Procédures potentiellement vulnérables :\n');
    vulnerableProcedures.forEach(proc => {
      console.log(`  - ${proc.path}`);
    });
    console.log('');
  }

  if (proceduresWithoutInput.length > 0) {
    console.log('ℹ️  Procédures sans input (peut être normal) :\n');
    proceduresWithoutInput.forEach(proc => {
      console.log(`  - ${proc.path}`);
    });
    console.log('');
  }

  console.log('✅ Vérification terminée !');
  
  if (vulnerableProcedures.length === 0) {
    console.log('\n✨ Toutes les mutations publiques ont une validation !');
    process.exit(0);
  } else {
    console.log('\n⚠️  Des mutations publiques n\'ont pas de validation !');
    process.exit(1);
  }
}

main();
