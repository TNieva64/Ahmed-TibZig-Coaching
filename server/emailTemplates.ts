/**
 * Email templates for onboarding sequence
 * Professional HTML emails with brand colors (black/gold)
 */

export const emailTemplates = {
  // Day 0: Welcome email
  welcome: {
    name: "welcome",
    subject: "🎉 Bienvenue chez Andaloussi Coaching !",
    category: "onboarding",
    htmlBody: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000000;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #1a1a1a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(212, 175, 55, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 32px; font-weight: bold;">Andaloussi Coaching</h1>
              <p style="margin: 10px 0 0; color: #999999; font-size: 14px;">ATHLÈTE PARALYMPIEN • COACH CERTIFIÉ</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #D4AF37; font-size: 24px;">Bienvenue {{userName}} ! 🎉</h2>
              
              <p style="margin: 0 0 15px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                Félicitations pour avoir franchi le pas ! Vous venez de rejoindre une communauté d'athlètes déterminés à transformer leur potentiel en résultats concrets.
              </p>
              
              <p style="margin: 0 0 15px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                En tant qu'athlète paralympien et coach certifié, je sais ce qu'il faut pour atteindre l'excellence. Mon objectif : vous accompagner vers <strong style="color: #D4AF37;">votre meilleure version</strong>.
              </p>
              
              <!-- CTA Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0; background-color: #0a0a0a; border-left: 4px solid #D4AF37; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px; color: #D4AF37; font-size: 18px;">🚀 Vos prochaines étapes</h3>
                    <ul style="margin: 10px 0; padding-left: 20px; color: #cccccc; font-size: 15px; line-height: 1.8;">
                      <li>Complétez votre profil et vos objectifs</li>
                      <li>Explorez votre programme personnalisé</li>
                      <li>Réservez votre première séance de coaching</li>
                      <li>Rejoignez notre communauté WhatsApp</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{dashboardUrl}}" style="display: inline-block; padding: 15px 40px; background-color: #D4AF37; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">
                      Accéder à mon espace
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Besoin d'aide ? Répondez simplement à cet email, je suis là pour vous accompagner.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0 0 10px; color: #D4AF37; font-size: 16px; font-weight: bold;">
                Transformez votre potentiel
              </p>
              <p style="margin: 0 0 15px; color: #666666; font-size: 13px;">
                © 2026 Andaloussi Coaching. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px;">
                <a href="{{unsubscribeUrl}}" style="color: #999999; text-decoration: underline;">Se désabonner</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textBody: `Bienvenue {{userName}} !

Félicitations pour avoir franchi le pas ! Vous venez de rejoindre une communauté d'athlètes déterminés à transformer leur potentiel en résultats concrets.

En tant qu'athlète paralympien et coach certifié, je sais ce qu'il faut pour atteindre l'excellence. Mon objectif : vous accompagner vers votre meilleure version.

VOS PROCHAINES ÉTAPES :
- Complétez votre profil et vos objectifs
- Explorez votre programme personnalisé
- Réservez votre première séance de coaching
- Rejoignez notre communauté WhatsApp

Accédez à votre espace : {{dashboardUrl}}

Besoin d'aide ? Répondez simplement à cet email, je suis là pour vous accompagner.

---
Andaloussi Coaching
Transformez votre potentiel
`,
  },

  // Day 3: Tips and motivation
  day3_tips: {
    name: "day3_tips",
    subject: "💪 3 conseils pour maximiser vos résultats",
    category: "onboarding",
    htmlBody: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conseils J+3</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000000;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: bold;">Andaloussi Coaching</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #D4AF37; font-size: 24px;">Bonjour {{userName}} ! 👋</h2>
              
              <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                Vous voilà lancé depuis 3 jours ! Voici mes <strong style="color: #D4AF37;">3 conseils essentiels</strong> pour maximiser vos résultats dès maintenant.
              </p>
              
              <!-- Tip 1 -->
              <table role="presentation" style="width: 100%; margin: 20px 0; background-color: #0a0a0a; border-left: 4px solid #D4AF37; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px; color: #D4AF37; font-size: 18px;">1️⃣ La régularité bat l'intensité</h3>
                    <p style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                      Mieux vaut 3 séances de 30 minutes par semaine qu'une séance intense de 2h. La constance est la clé de la transformation. Programmez vos séances comme des rendez-vous non négociables.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Tip 2 -->
              <table role="presentation" style="width: 100%; margin: 20px 0; background-color: #0a0a0a; border-left: 4px solid #D4AF37; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px; color: #D4AF37; font-size: 18px;">2️⃣ La nutrition représente 70% des résultats</h3>
                    <p style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                      Vous ne pouvez pas compenser une mauvaise alimentation par l'entraînement. Utilisez notre calculateur de macros et notre base de recettes pour optimiser votre nutrition dès aujourd'hui.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Tip 3 -->
              <table role="presentation" style="width: 100%; margin: 20px 0; background-color: #0a0a0a; border-left: 4px solid #D4AF37; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px; color: #D4AF37; font-size: 18px;">3️⃣ Le repos fait partie de l'entraînement</h3>
                    <p style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.6;">
                      Vos muscles se construisent pendant le repos, pas pendant l'effort. Dormez 7-8h par nuit et respectez vos jours de récupération. La surcharge mène à la blessure, pas à la performance.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{nutritionUrl}}" style="display: inline-block; padding: 15px 40px; background-color: #D4AF37; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Découvrir les recettes
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Vous avez des questions sur votre programme ? Répondez à cet email, je suis là pour vous guider.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0 0 15px; color: #666666; font-size: 13px;">
                © 2026 Andaloussi Coaching. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px;">
                <a href="{{unsubscribeUrl}}" style="color: #999999; text-decoration: underline;">Se désabonner</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textBody: `Bonjour {{userName}} !

Vous voilà lancé depuis 3 jours ! Voici mes 3 conseils essentiels pour maximiser vos résultats dès maintenant.

1️⃣ LA RÉGULARITÉ BAT L'INTENSITÉ
Mieux vaut 3 séances de 30 minutes par semaine qu'une séance intense de 2h. La constance est la clé de la transformation.

2️⃣ LA NUTRITION REPRÉSENTE 70% DES RÉSULTATS
Vous ne pouvez pas compenser une mauvaise alimentation par l'entraînement. Utilisez notre calculateur de macros et notre base de recettes.

3️⃣ LE REPOS FAIT PARTIE DE L'ENTRAÎNEMENT
Vos muscles se construisent pendant le repos. Dormez 7-8h par nuit et respectez vos jours de récupération.

Découvrir les recettes : {{nutritionUrl}}

---
Andaloussi Coaching
`,
  },

  // Day 7: Check-in and motivation
  day7_checkin: {
    name: "day7_checkin",
    subject: "🎯 Votre première semaine : faisons le point !",
    category: "onboarding",
    htmlBody: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in J+7</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000000;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: bold;">Andaloussi Coaching</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #D4AF37; font-size: 24px;">{{userName}}, une semaine déjà ! 🎉</h2>
              
              <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.6;">
                Félicitations pour cette première semaine ! Chaque séance complétée, chaque repas équilibré, chaque nuit de sommeil respectée vous rapproche de vos objectifs.
              </p>
              
              <!-- Stats Box -->
              <table role="presentation" style="width: 100%; margin: 25px 0; background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h3 style="margin: 0 0 15px; color: #000000; font-size: 20px; font-weight: bold;">Vos statistiques de la semaine</h3>
                    <p style="margin: 0; color: #000000; font-size: 15px; line-height: 1.8;">
                      <strong>{{workoutsCompleted}}</strong> séances complétées<br>
                      <strong>{{nutritionDays}}</strong> jours de suivi nutrition<br>
                      <strong>{{badgesEarned}}</strong> badges débloqués
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Motivation -->
              <table role="presentation" style="width: 100%; margin: 20px 0; background-color: #0a0a0a; border-left: 4px solid #D4AF37; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px; color: #D4AF37; font-size: 18px;">💭 Réflexion de coach</h3>
                    <p style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.6; font-style: italic;">
                      "La différence entre un champion et les autres n'est pas le talent, c'est la discipline. Vous avez prouvé cette semaine que vous avez ce qu'il faut. Continuez, les résultats suivront."
                    </p>
                    <p style="margin: 15px 0 0; color: #D4AF37; font-size: 14px; font-weight: bold;">
                      - Ahmed Andaloussi
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <h3 style="margin: 30px 0 15px; color: #D4AF37; font-size: 20px;">🚀 Cette semaine, concentrez-vous sur :</h3>
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #cccccc; font-size: 15px; line-height: 1.8;">
                <li>Maintenir votre régularité (minimum 3 séances)</li>
                <li>Augmenter légèrement l'intensité si vous vous sentez prêt</li>
                <li>Tester 2 nouvelles recettes de notre base de données</li>
                <li>Prendre vos photos de progression (important !)</li>
              </ul>
              
              <!-- Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{progressUrl}}" style="display: inline-block; padding: 15px 40px; background-color: #D4AF37; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Voir ma progression
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Des difficultés ? Des questions ? Répondez à cet email, je suis là pour ajuster votre programme.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0 0 15px; color: #666666; font-size: 13px;">
                © 2026 Andaloussi Coaching. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px;">
                <a href="{{unsubscribeUrl}}" style="color: #999999; text-decoration: underline;">Se désabonner</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textBody: `{{userName}}, une semaine déjà ! 🎉

Félicitations pour cette première semaine ! Chaque séance complétée, chaque repas équilibré, chaque nuit de sommeil respectée vous rapproche de vos objectifs.

VOS STATISTIQUES DE LA SEMAINE :
- {{workoutsCompleted}} séances complétées
- {{nutritionDays}} jours de suivi nutrition
- {{badgesEarned}} badges débloqués

RÉFLEXION DE COACH :
"La différence entre un champion et les autres n'est pas le talent, c'est la discipline. Vous avez prouvé cette semaine que vous avez ce qu'il faut. Continuez, les résultats suivront."
- Ahmed Andaloussi

CETTE SEMAINE, CONCENTREZ-VOUS SUR :
- Maintenir votre régularité (minimum 3 séances)
- Augmenter légèrement l'intensité si vous vous sentez prêt
- Tester 2 nouvelles recettes de notre base de données
- Prendre vos photos de progression (important !)

Voir ma progression : {{progressUrl}}

---
Andaloussi Coaching
`,
  },
};

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}
