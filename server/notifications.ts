import { notifyOwner } from "./_core/notification";

/**
 * Envoie une notification au propriétaire quand un nouveau client s'inscrit
 */
export async function notifyNewClientSignup(clientName: string, clientEmail: string) {
  try {
    await notifyOwner({
      title: "Nouveau client inscrit",
      content: `${clientName} (${clientEmail}) vient de s'inscrire sur votre plateforme de coaching.`,
    });
  } catch (error) {
    console.error("[Notifications] Failed to notify new client signup:", error);
  }
}

/**
 * Envoie une notification au propriétaire quand un programme est assigné à un client
 */
export async function notifyProgramAssigned(clientName: string, programName: string) {
  try {
    await notifyOwner({
      title: "Programme assigné",
      content: `Le programme "${programName}" a été assigné à ${clientName}.`,
    });
  } catch (error) {
    console.error("[Notifications] Failed to notify program assigned:", error);
  }
}

/**
 * Envoie une notification au propriétaire quand une nouvelle ressource est ajoutée
 */
export async function notifyResourceAdded(resourceTitle: string, programName: string) {
  try {
    await notifyOwner({
      title: "Nouvelle ressource ajoutée",
      content: `La ressource "${resourceTitle}" a été ajoutée au programme "${programName}".`,
    });
  } catch (error) {
    console.error("[Notifications] Failed to notify resource added:", error);
  }
}

/**
 * Envoie une notification au propriétaire quand un client complète un programme
 */
export async function notifyProgramCompleted(clientName: string, programName: string) {
  try {
    await notifyOwner({
      title: "Programme complété",
      content: `${clientName} a complété le programme "${programName}".`,
    });
  } catch (error) {
    console.error("[Notifications] Failed to notify program completed:", error);
  }
}
