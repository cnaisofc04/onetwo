import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isResendConfigured = RESEND_API_KEY && RESEND_API_KEY.startsWith('re_');
const resend = isResendConfigured ? new Resend(RESEND_API_KEY) : null;

type ChangeNotification = {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
};

export class EmailNotificationService {
  /**
   * Send notification email when user changes profile settings
   */
  static async sendSettingsChangedEmail(
    email: string,
    changes: ChangeNotification[],
    affectedTab: string
  ): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('⚠️ Resend not configured - skipping email notification');
        return false;
      }

      if (!email || changes.length === 0) {
        console.error('Invalid email or empty changes');
        return false;
      }

      // Format changes for email
      const changesHtml = changes
        .map((change) => {
          const oldVal = formatValue(change.oldValue);
          const newVal = formatValue(change.newValue);
          return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; font-weight: 500; color: #374151;">${change.field}</td>
              <td style="padding: 12px; color: #6b7280;">${oldVal}</td>
              <td style="padding: 12px; color: #059669; font-weight: 500;">${newVal}</td>
            </tr>
          `;
        })
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
              .section { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; border-radius: 4px; }
              .badge { display: inline-block; background: #ede9fe; color: #7c3aed; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Modification de Paramètres</h1>
                <p>Vos paramètres OneTwo ont été modifiés</p>
              </div>

              <div class="content">
                <div class="section">
                  <p>Bonjour,</p>
                  <p>Nous vous notifions que <strong>${changes.length} modification(s)</strong> a été apportée à votre compte.</p>
                  <div class="badge">${affectedTab}</div>
                </div>

                <div class="section">
                  <h3 style="margin-top: 0; color: #374151;">Modifications effectuées:</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Paramètre</th>
                        <th>Ancienne valeur</th>
                        <th>Nouvelle valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${changesHtml}
                    </tbody>
                  </table>
                </div>

                <div class="warning">
                  <strong>⚠️ Sécurité:</strong> Si vous n'avez pas effectué cette modification, veuillez changer votre mot de passe immédiatement et contacter notre équipe de support.
                </div>

                <div class="section">
                  <p><strong>Date/Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                  <p><strong>Adresse IP:</strong> [À implémenter avec middleware]</p>
                </div>

                <div class="footer">
                  <p>OneTwo - Application de Rencontre & Réseau Social</p>
                  <p>© 2025 OneTwo. Tous droits réservés.</p>
                  <p><a href="#" style="color: #667eea; text-decoration: none;">Paramètres de sécurité</a> | <a href="#" style="color: #667eea; text-decoration: none;">Centre d'aide</a></p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: 'security@onetwo.app',
        to: email,
        subject: `🔐 Modification de vos paramètres OneTwo - ${formatTabName(affectedTab)}`,
        html,
      });

      if (response.data?.id) {
        console.log(`✅ Email notification sent: ${response.data.id}`);
        return true;
      } else {
        console.error('❌ Failed to send email notification:', response.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending settings changed email:', error);
      return false;
    }
  }

  /**
   * Send email when user changes password
   */
  static async sendPasswordChangedEmail(email: string, ipAddress: string): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('⚠️ Resend not configured - skipping password change notification');
        return false;
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: sans-serif; color: #111827;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1>🔒 Changement de mot de passe</h1>
              <p>Votre mot de passe a été changé avec succès.</p>
              
              <p><strong>Date/Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p><strong>Adresse IP:</strong> ${ipAddress}</p>
              
              <p>Si vous n'avez pas effectué cette action, veuillez immédiatement changer votre mot de passe et contacter notre support.</p>
            </div>
          </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: 'security@onetwo.app',
        to: email,
        subject: '🔒 Votre mot de passe a été changé',
        html,
      });

      return !!response.data?.id;
    } catch (error) {
      console.error('Error sending password changed email:', error);
      return false;
    }
  }

  /**
   * Send email when user enables/disables shadow zone
   */
  static async sendShadowZoneChangedEmail(
    email: string,
    enabled: boolean,
    radius: number
  ): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('⚠️ Resend not configured - skipping shadow zone notification');
        return false;
      }

      const status = enabled ? 'ACTIVÉE' : 'DÉSACTIVÉE';
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: sans-serif; color: #111827;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1>🌍 Zone d'ombre ${status}</h1>
              <p>Votre zone d'ombre a été ${enabled ? 'activée' : 'désactivée'}.</p>
              
              ${enabled ? `<p><strong>Rayon de protection:</strong> ${radius} km</p>` : ''}
              
              <p>Vous pouvez modifier ces paramètres à tout moment dans vos préférences de sécurité.</p>
            </div>
          </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: 'security@onetwo.app',
        to: email,
        subject: `🌍 Zone d'ombre ${status}`,
        html,
      });

      return !!response.data?.id;
    } catch (error) {
      console.error('Error sending shadow zone email:', error);
      return false;
    }
  }

  /**
   * Send digest email with all changes of the day
   */
  static async sendDailyDigest(
    email: string,
    changes: ChangeNotification[]
  ): Promise<boolean> {
    try {
      if (!resend || changes.length === 0) {
        return false;
      }

      const groupedByTab = groupChangesByTab(changes);
      const tabsHtml = Object.entries(groupedByTab)
        .map(([tab, tabChanges]) => `
          <div style="margin: 20px 0;">
            <h3>${formatTabName(tab)}</h3>
            <ul>
              ${tabChanges.map((c) => `<li>${c.field}: ${formatValue(c.oldValue)} → ${formatValue(c.newValue)}</li>`).join('')}
            </ul>
          </div>
        `)
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: sans-serif; color: #111827;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1>📊 Résumé des modifications - ${new Date().toLocaleDateString('fr-FR')}</h1>
              <p>Voici un résumé de toutes les modifications apportées à votre compte aujourd'hui.</p>
              ${tabsHtml}
            </div>
          </body>
        </html>
      `;

      const response = await resend.emails.send({
        from: 'digest@onetwo.app',
        to: email,
        subject: `📊 Résumé OneTwo - ${new Date().toLocaleDateString('fr-FR')}`,
        html,
      });

      return !!response.data?.id;
    } catch (error) {
      console.error('Error sending daily digest:', error);
      return false;
    }
  }
}

// ============ HELPER FUNCTIONS ============

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (typeof value === 'number') {
    // If it looks like a percentage
    if (value >= 0 && value <= 100) return `${value}%`;
    return value.toString();
  }
  return String(value);
}

function formatTabName(tab: string): string {
  const names: Record<string, string> = {
    profile: '👤 Profil',
    preferences: '🎯 Préférences',
    privacy: '🔒 Sécurité',
    notifications: '🔔 Notifications',
  };
  return names[tab] || tab;
}

function groupChangesByTab(changes: ChangeNotification[]): Record<string, ChangeNotification[]> {
  const grouped: Record<string, ChangeNotification[]> = {};
  
  changes.forEach((change) => {
    const tab = determineTab(change.field);
    if (!grouped[tab]) {
      grouped[tab] = [];
    }
    grouped[tab].push(change);
  });
  
  return grouped;
}

function determineTab(field: string): string {
  const profileFields = ['firstName', 'lastName', 'professionalStatus', 'interests', 'profession'];
  const preferenceFields = ['shyness', 'introversion', 'religion', 'hairColor', 'eyeColor', 'tattooPreference', 'smokingPreference'];
  const privacyFields = ['shadowZoneEnabled', 'shadowAddresses', 'shadowRadius'];
  
  if (profileFields.includes(field)) return 'profile';
  if (preferenceFields.includes(field)) return 'preferences';
  if (privacyFields.includes(field)) return 'privacy';
  return 'other';
}
