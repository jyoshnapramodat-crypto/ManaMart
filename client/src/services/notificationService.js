/**
 * ManaMart In-Memory & LocalStorage Simulated Email & OTP Notification Service
 * Allows testing of Dine-In Table Reservations, verification OTPs, and confirmation emails
 * without needing an external SMTP provider.
 */

const STORAGE_INBOX_KEY = 'manamart_fake_mailbox';
const STORAGE_OTPS_KEY = 'manamart_active_otps';
const STORAGE_RESERVATIONS_KEY = 'manamart_reservations';

class NotificationService {
  constructor() {
    this.subscribers = new Set();
    this.inbox = this.loadInbox();
    this.activeOtps = this.loadOtps();

    // Clean up expired OTPs on initialization
    this.cleanupExpiredOtps();
  }

  loadInbox() {
    try {
      const stored = localStorage.getItem(STORAGE_INBOX_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load fake inbox from localStorage:', e);
    }
    return [];
  }

  saveInbox() {
    try {
      localStorage.setItem(STORAGE_INBOX_KEY, JSON.stringify(this.inbox));
    } catch (e) {
      console.warn('Failed to save fake inbox:', e);
    }
  }

  loadOtps() {
    try {
      const stored = localStorage.getItem(STORAGE_OTPS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load OTPs:', e);
    }
    return {};
  }

  saveOtps() {
    try {
      localStorage.setItem(STORAGE_OTPS_KEY, JSON.stringify(this.activeOtps));
    } catch (e) {
      console.warn('Failed to save OTPs:', e);
    }
  }

  cleanupExpiredOtps() {
    const now = Date.now();
    let changed = false;
    for (const email in this.activeOtps) {
      if (this.activeOtps[email].expiresAt < now) {
        delete this.activeOtps[email];
        changed = true;
      }
    }
    if (changed) this.saveOtps();
  }

  /**
   * Subscribe a component or hook to mock mailbox updates
   * @param {Function} callback - invoked with (inbox, latestEmail)
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers(latestEmail) {
    this.subscribers.forEach((cb) => {
      try {
        cb(this.inbox, latestEmail);
      } catch (err) {
        console.error('Subscriber error in notificationService:', err);
      }
    });

    // Also dispatch a browser custom event for toasts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('manamart:fake-email-received', {
          detail: latestEmail,
        })
      );
    }
  }

  /**
   * Step 1: Generate secure 6-digit numeric OTP and send simulated OTP email
   */
  sendOtpEmail(email, contextDetails = {}) {
    const cleanEmail = email.trim().toLowerCase();
    // 6-digit numeric OTP (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    this.activeOtps[cleanEmail] = {
      otp,
      expiresAt,
      contextDetails,
      createdAt: Date.now(),
    };
    this.saveOtps();

    const restaurantName = contextDetails.restaurantName || 'ManaMart Dining Partner';
    const guestName = contextDetails.guestName || 'Valued Guest';
    const date = contextDetails.date || 'Upcoming Date';
    const time = contextDetails.time || 'Evening';
    const guests = contextDetails.guests || 2;

    const subject = `🔐 Verification Code: ${otp} for Table Booking at ${restaurantName}`;

    const textBody = `Namaste ${guestName},

Your verification OTP for table reservation at ${restaurantName} is: ${otp}

Booking Details:
- Date: ${date}
- Time: ${time}
- Party Size: ${guests} Guests

This code is valid for 5 minutes. Do not share this OTP with anyone.

- Team ManaMart (Mana Ooru. Mana Market.)`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #003527 0%, #055c24 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">ManaMart Dine-In Reservations</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #a5f5ab;">Mana Ooru. Mana Market.</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600;">Namaste ${guestName},</p>
          <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #475569;">
            Please use the following 6-digit One-Time Password (OTP) to verify your table reservation at <strong>${restaurantName}</strong>:
          </p>
          
          <div style="background: #fff8ef; border: 2px dashed #fe6b00; border-radius: 16px; padding: 18px; text-align: center; margin: 20px 0;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fe6b00; letter-spacing: 1px; display: block; margin-bottom: 6px;">Your 6-Digit Verification OTP</span>
            <span style="font-size: 32px; font-family: monospace; font-weight: 900; letter-spacing: 6px; color: #003527; display: block;">${otp}</span>
            <span style="font-size: 11px; color: #64748b; display: block; margin-top: 6px;">⏰ Expires in 5 minutes (Valid until ${new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 14px; font-size: 12px; color: #334155; margin-bottom: 20px;">
            <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Reservation Summary:</strong>
            <div>📅 <strong>Date:</strong> ${date}</div>
            <div>⏰ <strong>Time Slot:</strong> ${time}</div>
            <div>👥 <strong>Guests:</strong> ${guests} Persons</div>
          </div>

          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center;">
            This email was generated by ManaMart's simulated development mailbox.
          </p>
        </div>
      </div>
    `;

    const mockEmail = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      to: cleanEmail,
      subject,
      type: 'otp',
      otpCode: otp,
      textBody,
      htmlBody,
      timestamp: new Date().toISOString(),
      expiresAt,
      isRead: false,
    };

    this.inbox = [mockEmail, ...this.inbox].slice(0, 50); // keep last 50 emails
    this.saveInbox();
    this.notifySubscribers(mockEmail);

    return {
      success: true,
      otp,
      message: `OTP sent to ${cleanEmail}. Check the Dev Fake Mailbox!`,
    };
  }

  /**
   * Step 3: Verify the entered OTP against active OTPs
   */
  verifyOtp(email, enteredOtp) {
    this.cleanupExpiredOtps();
    const cleanEmail = email.trim().toLowerCase();
    const record = this.activeOtps[cleanEmail];

    if (!record) {
      return {
        success: false,
        message: 'No active OTP found for this email. Please request a new OTP.',
      };
    }

    if (Date.now() > record.expiresAt) {
      delete this.activeOtps[cleanEmail];
      this.saveOtps();
      return {
        success: false,
        message: 'This OTP has expired (5-minute limit exceeded). Please request a fresh OTP.',
      };
    }

    if (record.otp.trim() !== enteredOtp.trim()) {
      return {
        success: false,
        message: 'Invalid OTP entered. Please check the Dev Fake Mailbox and try again.',
      };
    }

    // OTP Verified! Consume it.
    const contextDetails = record.contextDetails;
    delete this.activeOtps[cleanEmail];
    this.saveOtps();

    return {
      success: true,
      message: 'Email verified successfully!',
      contextDetails,
    };
  }

  /**
   * Post-Confirmation Email Notification
   */
  sendReservationConfirmation(email, bookingDetails) {
    const cleanEmail = email.trim().toLowerCase();
    const bookingId = bookingDetails.bookingId || `MNM-RES-${Math.floor(100000 + Math.random() * 900000)}`;
    const restaurantName = bookingDetails.restaurantName || 'Swagath Grand Authentic Kitchen';
    const guestName = bookingDetails.guestName || 'Valued Customer';
    const date = bookingDetails.date || new Date().toISOString().split('T')[0];
    const time = bookingDetails.time || '08:00 PM';
    const guests = bookingDetails.guests || 4;
    const tableNumber = bookingDetails.tableNumber || 'T-04';
    const seatingArea = bookingDetails.seatingArea || 'AC Fine Dining Hall';
    const phone = bookingDetails.phone || '9876543210';
    const specialRequests = bookingDetails.specialRequests || 'None';

    const subject = `🎉 Reservation Confirmed at ${restaurantName} [#${bookingId}]`;

    const textBody = `Namaste ${guestName},

Your dine-in table reservation at ${restaurantName} is CONFIRMED!

Booking Reference: #${bookingId}
- Restaurant: ${restaurantName}
- Date: ${date}
- Time: ${time}
- Party: ${guests} Guests
- Assigned Table: ${tableNumber} (${seatingArea})
- Special Notes: ${specialRequests}

Please arrive 10 minutes prior to your time slot. Show this confirmation pass at the restaurant reception.

- Team ManaMart (Mana Ooru. Mana Market.)`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 24px; overflow: hidden; background: #ffffff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #003527 0%, #055c24 100%); padding: 26px; color: #ffffff; text-align: center;">
          <span style="background: #a5f5ab; color: #003527; font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 4px 12px; border-radius: 12px; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px;">DINE-IN RESERVATION PASS</span>
          <h2 style="margin: 0; font-size: 22px; font-weight: 900;">${restaurantName}</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #d1fae5;">Table Booking Confirmed & Guaranteed</p>
        </div>

        <div style="padding: 24px; color: #1e293b;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Booking Reference</span>
              <div style="font-size: 16px; font-family: monospace; font-weight: 900; color: #003527;">#${bookingId}</div>
            </div>
            <div style="text-align: right;">
              <span style="background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; border: 1px solid #a7f3d0;">✓ CONFIRMED</span>
            </div>
          </div>

          <div style="background: #f8fafc; border-radius: 16px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 40%;">Guest Name:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${guestName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Date & Time:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #fe6b00;">${date} at ${time}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Party Size:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${guests} Guests</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Table & Seating:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #003527;">${tableNumber} (${seatingArea})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Contact:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${phone} • ${cleanEmail}</td>
              </tr>
              ${specialRequests && specialRequests !== 'None' ? `
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Special Notes:</td>
                  <td style="padding: 6px 0; font-style: italic; color: #334155;">"${specialRequests}"</td>
                </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #fff8ef; border: 1px solid #fed7aa; border-radius: 14px; padding: 12px; font-size: 12px; color: #9a3412; margin-bottom: 20px; line-height: 1.4;">
            ℹ️ <strong>Arrival Policy:</strong> Please arrive at the restaurant 10 minutes prior to ${time}. Table is held for a grace period of 15 minutes.
          </div>

          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center;">
            Thank you for dining locally with ManaMart Hyperlocal Platform.
          </p>
        </div>
      </div>
    `;

    const mockEmail = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      to: cleanEmail,
      subject,
      type: 'confirmation',
      bookingId,
      bookingDetails: {
        bookingId,
        restaurantName,
        guestName,
        date,
        time,
        guests,
        tableNumber,
        seatingArea,
        phone,
        email: cleanEmail,
        specialRequests,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      },
      textBody,
      htmlBody,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.inbox = [mockEmail, ...this.inbox].slice(0, 50);
    this.saveInbox();

    // Also persist reservation to localStorage so it immediately appears in user bookings
    this.saveReservationLocally(mockEmail.bookingDetails);

    this.notifySubscribers(mockEmail);

    return {
      success: true,
      bookingId,
      mockEmail,
    };
  }

  saveReservationLocally(reservation) {
    try {
      const stored = localStorage.getItem(STORAGE_RESERVATIONS_KEY);
      const list = stored ? JSON.parse(stored) : [];
      const updated = [reservation, ...list.filter((r) => r.bookingId !== reservation.bookingId)];
      localStorage.setItem(STORAGE_RESERVATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save reservation locally:', e);
    }
  }

  getSavedReservations() {
    try {
      const stored = localStorage.getItem(STORAGE_RESERVATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  getInbox() {
    return this.inbox;
  }

  clearInbox() {
    this.inbox = [];
    this.saveInbox();
    this.notifySubscribers(null);
  }

  deleteEmail(emailId) {
    this.inbox = this.inbox.filter((e) => e.id !== emailId);
    this.saveInbox();
    this.notifySubscribers(null);
  }

  markAsRead(emailId) {
    this.inbox = this.inbox.map((e) => (e.id === emailId ? { ...e, isRead: true } : e));
    this.saveInbox();
    this.notifySubscribers(null);
  }

  /**
   * Helper to broadcast auto-fill event to active OTP inputs
   */
  triggerAutoFill(otpCode) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('manamart:autofill-otp', {
          detail: { otp: otpCode },
        })
      );
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

