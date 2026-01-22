import nodemailer from "nodemailer";
import { getDb } from "./db";
import { emailLogs, emailTemplates as emailTemplatesTable } from "../drizzle/schema";
import { emailTemplates, replaceTemplateVariables } from "./emailTemplates";
import { eq } from "drizzle-orm";

/**
 * Email service for sending transactional and marketing emails
 * Uses nodemailer with SMTP configuration
 */

// SMTP Configuration (using environment variables)
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@andaloussicoaching.com";
const FROM_NAME = process.env.FROM_NAME || "Andaloussi Coaching";

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    // For development: use console logging if SMTP not configured
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("[Email Service] SMTP credentials not configured. Emails will be logged to console only.");
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      });
    } else {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    }
  }
  return transporter;
}

interface SendEmailParams {
  userId: number;
  recipientEmail: string;
  recipientName: string;
  templateName: "welcome" | "day3_tips" | "day7_checkin";
  variables: Record<string, string>;
}

/**
 * Send an email using a template
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const { userId, recipientEmail, recipientName, templateName, variables } = params;

  try {
    const db = await getDb();
    if (!db) {
      console.error(`[Email Service] Database not available`);
      return false;
    }
    
    // Get template
    const template = emailTemplates[templateName];
    if (!template) {
      console.error(`[Email Service] Template not found: ${templateName}`);
      return false;
    }

    // Replace variables in subject and body
    const allVariables = {
      userName: recipientName,
      ...variables,
    };

    const subject = replaceTemplateVariables(template.subject, allVariables);
    const htmlBody = replaceTemplateVariables(template.htmlBody, allVariables);
    const textBody = replaceTemplateVariables(template.textBody, allVariables);

    // Send email
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject,
      html: htmlBody,
      text: textBody,
    });

    console.log(`[Email Service] Email sent to ${recipientEmail}: ${info.messageId}`);

    // Log to database
    await db.insert(emailLogs).values({
      userId,
      templateName,
      recipientEmail,
      subject,
      status: "sent",
      sentAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error(`[Email Service] Error sending email to ${recipientEmail}:`, error);

    // Log failure to database
    try {
      const dbForLog = await getDb();
      if (!dbForLog) return false;
      await dbForLog.insert(emailLogs).values({
        userId,
        templateName,
        recipientEmail,
        subject: emailTemplates[templateName].subject,
        status: "failed",
        failedReason: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (logError) {
      console.error("[Email Service] Error logging failed email:", logError);
    }

    return false;
  }
}

/**
 * Send welcome email (Day 0)
 */
export async function sendWelcomeEmail(
  userId: number,
  email: string,
  name: string,
  dashboardUrl: string
): Promise<boolean> {
  return sendEmail({
    userId,
    recipientEmail: email,
    recipientName: name,
    templateName: "welcome",
    variables: {
      dashboardUrl,
      unsubscribeUrl: `${dashboardUrl}/unsubscribe?userId=${userId}`,
    },
  });
}

/**
 * Send Day 3 tips email
 */
export async function sendDay3TipsEmail(
  userId: number,
  email: string,
  name: string,
  nutritionUrl: string
): Promise<boolean> {
  return sendEmail({
    userId,
    recipientEmail: email,
    recipientName: name,
    templateName: "day3_tips",
    variables: {
      nutritionUrl,
      unsubscribeUrl: `${nutritionUrl}/unsubscribe?userId=${userId}`,
    },
  });
}

/**
 * Send Day 7 check-in email
 */
export async function sendDay7CheckinEmail(
  userId: number,
  email: string,
  name: string,
  progressUrl: string,
  stats: {
    workoutsCompleted: number;
    nutritionDays: number;
    badgesEarned: number;
  }
): Promise<boolean> {
  return sendEmail({
    userId,
    recipientEmail: email,
    recipientName: name,
    templateName: "day7_checkin",
    variables: {
      progressUrl,
      workoutsCompleted: stats.workoutsCompleted.toString(),
      nutritionDays: stats.nutritionDays.toString(),
      badgesEarned: stats.badgesEarned.toString(),
      unsubscribeUrl: `${progressUrl}/unsubscribe?userId=${userId}`,
    },
  });
}

/**
 * Send notification to admin (Ahmed) when a new user signs up
 */
export async function sendNewUserNotification(userEmail: string, userName: string, userId: number): Promise<boolean> {
  const adminEmail = process.env.OWNER_EMAIL || "ahmed@andaloussicoaching.com";
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #D4AF37; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0; }
        .info-label { font-weight: bold; color: #D4AF37; margin-bottom: 5px; }
        .info-value { color: #333; font-size: 16px; }
        .cta-button { display: inline-block; background: #D4AF37; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Nouvelle Inscription</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Un nouveau client vient de rejoindre votre plateforme</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Bonjour Ahmed,</p>
          <p>Un nouveau client vient de s'inscrire sur votre plateforme de coaching. Voici ses informations :</p>
          
          <div class="info-box">
            <div class="info-label">👤 Nom</div>
            <div class="info-value">${userName}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">📧 Email</div>
            <div class="info-value">${userEmail}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">🆔 ID Utilisateur</div>
            <div class="info-value">#${userId}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">📅 Date d'inscription</div>
            <div class="info-value">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          
          <p style="margin-top: 30px;">N'oubliez pas de :</p>
          <ul style="color: #666;">
            <li>Consulter son questionnaire d'onboarding</li>
            <li>Lui envoyer un message de bienvenue personnalisé</li>
            <li>Créer son premier programme d'entraînement</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="https://andaloussicoaching.com/admin" class="cta-button">Accéder au Dashboard Admin</a>
          </div>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par votre plateforme Andaloussi Coaching</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email without logging to database (admin notification)
  const transport = getTransporter();
  
  try {
    const info = await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `🎉 Nouvelle inscription : ${userName}`,
      html: htmlContent,
    });

    console.log(`[Email Service] New user notification sent to ${adminEmail}:`, info.messageId);
    
    // If using streamTransport (dev mode), log the email content
    if (!SMTP_USER || !SMTP_PASS) {
      console.log("\n=== EMAIL CONTENT (DEV MODE) ===");
      console.log(`To: ${adminEmail}`);
      console.log(`Subject: 🎉 Nouvelle inscription : ${userName}`);
      console.log(`User: ${userName} (${userEmail})`);
      console.log(`User ID: ${userId}`);
      console.log("==================================\n");
    }
    
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send new user notification:", error);
    return false;
  }
}

/**
 * Initialize email templates in database
 */
export async function initializeEmailTemplates(): Promise<void> {
  try {
    const dbInit = await getDb();
    if (!dbInit) {
      console.error("[Email Service] Database not available for template initialization");
      return;
    }

    for (const template of Object.values(emailTemplates)) {
      // Check if template already exists
      const existing = await dbInit
        .select()
        .from(emailTemplatesTable)
        .where(eq(emailTemplatesTable.name, template.name))
        .limit(1);

      if (existing.length === 0) {
        await dbInit.insert(emailTemplatesTable).values({
          name: template.name,
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
          category: template.category,
          isActive: 1,
        });
        console.log(`[Email Service] Template initialized: ${template.name}`);
      }
    }
  } catch (error) {
    console.error("[Email Service] Error initializing templates:", error);
  }
}


/**
 * Envoyer email au client après validation d'ajustement de macros
 */
export async function sendMacroAdjustmentEmail(
  recipientEmail: string,
  recipientName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number
): Promise<void> {
  const transporter = getTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .macros-box { background: white; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .macro-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .macro-item:last-child { border-bottom: none; }
    .macro-label { font-weight: bold; color: #6b7280; }
    .macro-value { font-size: 1.2em; font-weight: bold; color: #f59e0b; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 0.9em; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nouvelles Macros Validées !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${recipientName},</p>
      
      <p>Ahmed a analysé votre progression et a validé un ajustement personnalisé de vos macros nutritionnelles. Ces nouvelles valeurs sont optimisées pour vous aider à atteindre vos objectifs plus efficacement.</p>
      
      <div class="macros-box">
        <h3 style="margin-top: 0; color: #f59e0b;">📊 Vos Nouvelles Macros</h3>
        <div class="macro-item">
          <span class="macro-label">Calories</span>
          <span class="macro-value">${calories} kcal</span>
        </div>
        <div class="macro-item">
          <span class="macro-label">Protéines</span>
          <span class="macro-value">${protein} g</span>
        </div>
        <div class="macro-item">
          <span class="macro-label">Glucides</span>
          <span class="macro-value">${carbs} g</span>
        </div>
        <div class="macro-item">
          <span class="macro-label">Lipides</span>
          <span class="macro-value">${fat} g</span>
        </div>
      </div>
      
      <p><strong>💡 Pourquoi cet ajustement ?</strong></p>
      <p>Cet ajustement a été calculé en fonction de votre évolution récente (poids, performances, énergie). Il est conçu pour optimiser vos résultats tout en restant réaliste et durable.</p>
      
      <p><strong>📱 Prochaines étapes :</strong></p>
      <ul>
        <li>Connectez-vous à votre dashboard pour voir le détail</li>
        <li>Consultez vos recettes adaptées à ces nouvelles macros</li>
        <li>Contactez Ahmed si vous avez des questions</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="https://andaloussicoaching.com/dashboard" class="cta-button">
          Voir Mon Dashboard
        </a>
      </div>
      
      <p style="margin-top: 30px;">Continuez comme ça, vous êtes sur la bonne voie ! 💪</p>
      
      <p>
        Ahmed Andaloussi<br>
        <em>Coach Sportif Certifié CQP</em>
      </p>
    </div>
    <div class="footer">
      <p>Andaloussi Coaching - Coaching Sportif Premium</p>
      <p>Vous recevez cet email car vous êtes client chez Andaloussi Coaching.</p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: recipientEmail,
    subject: "🎯 Vos nouvelles macros sont prêtes !",
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Macro adjustment email sent to ${recipientEmail}:`, info.messageId);
  } catch (error) {
    console.error(`[Email] Failed to send macro adjustment email to ${recipientEmail}:`, error);
    throw error;
  }
}


/**
 * Notifier Ahmed qu'une nouvelle proposition d'ajustement de macros est en attente
 */
export async function sendMacroProposalNotificationToAhmed(
  clientName: string,
  clientEmail: string,
  currentWeight: number,
  proposedWeight: number,
  reason: string
): Promise<void> {
  const transporter = getTransporter();
  const OWNER_EMAIL = process.env.OWNER_EMAIL || "ahmed@andaloussicoaching.com";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .client-info { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Nouvelle Proposition d'Ajustement</h1>
    </div>
    <div class="content">
      <p>Bonjour Ahmed,</p>
      
      <div class="alert-box">
        <strong>🔔 Action requise :</strong> Une nouvelle proposition d'ajustement de macros a été générée automatiquement et nécessite votre validation.
      </div>
      
      <div class="client-info">
        <h3 style="margin-top: 0; color: #f59e0b;">👤 Informations Client</h3>
        <div class="info-row">
          <span><strong>Nom :</strong></span>
          <span>${clientName}</span>
        </div>
        <div class="info-row">
          <span><strong>Email :</strong></span>
          <span>${clientEmail}</span>
        </div>
        <div class="info-row">
          <span><strong>Poids actuel :</strong></span>
          <span>${proposedWeight} kg</span>
        </div>
        <div class="info-row">
          <span><strong>Poids précédent :</strong></span>
          <span>${currentWeight} kg</span>
        </div>
        <div class="info-row">
          <span><strong>Évolution :</strong></span>
          <span style="color: ${proposedWeight > currentWeight ? '#ef4444' : '#10b981'}; font-weight: bold;">
            ${proposedWeight > currentWeight ? '+' : ''}${(proposedWeight - currentWeight).toFixed(1)} kg
          </span>
        </div>
      </div>
      
      <div style="background: #fff7ed; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <strong>📊 Raison de l'ajustement :</strong>
        <p style="margin: 10px 0 0 0;">${reason}</p>
      </div>
      
      <p><strong>🎯 Prochaines étapes :</strong></p>
      <ul>
        <li>Connectez-vous à votre interface admin</li>
        <li>Consultez la proposition détaillée</li>
        <li>Validez, modifiez ou refusez l'ajustement</li>
        <li>Le client recevra automatiquement un email après votre validation</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="https://andaloussicoaching.com/admin/macro-adjustments" class="cta-button">
          Voir les Propositions en Attente
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 0.9em;">
        💡 <strong>Conseil :</strong> Vérifiez toujours le contexte global du client (progression, énergie, adhérence) avant de valider un ajustement automatique.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: OWNER_EMAIL,
    subject: `⚠️ Nouvelle proposition d'ajustement - ${clientName}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Macro proposal notification sent to Ahmed:`, info.messageId);
  } catch (error) {
    console.error(`[Email] Failed to send macro proposal notification to Ahmed:`, error);
    // Ne pas throw pour ne pas bloquer la création de la proposition
  }
}
