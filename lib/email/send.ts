import { getClient, isEmailConfigured } from "./client";
import { generateOrderConfirmationHtml } from "./templates/order-confirmation";
import { generateBookingConfirmationHtml } from "./templates/booking-confirmation";
import { generateBookingReminderHtml } from "./templates/booking-reminder";
import { generateWelcomeHtml } from "./templates/welcome";
import { generateOwnerNotificationHtml } from "./templates/owner-notification";
import { generateShippingNotificationHtml } from "./templates/shipping-notification";
import { generatePickupReadyHtml } from "./templates/pickup-ready";
import { logger } from "@/lib/utils/logger";
import type { Order, OrderItem, Booking, BookingService } from "@/types/database";

const FROM_EMAIL = "Armeria Palmetto <noreply@armeriapalmetto.it>";

export async function sendOrderConfirmation(
  order: Order,
  items: OrderItem[],
  customer: { email: string; name: string }
): Promise<void> {
  if (!isEmailConfigured()) {
    logger.info("Email not configured, skipping order confirmation", { orderId: order.id });
    return;
  }
  try {
    const html = generateOrderConfirmationHtml({ order, items, customerName: customer.name });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: `Conferma ordine #${order.order_number} — Armeria Palmetto`,
      html,
    });
    logger.info("Order confirmation email sent", { orderId: order.id });
  } catch (error) {
    logger.error("Failed to send order confirmation email", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendBookingConfirmation(
  booking: Booking,
  service: BookingService
): Promise<void> {
  if (!isEmailConfigured()) {
    logger.info("Email not configured, skipping booking confirmation", { bookingId: booking.id });
    return;
  }
  try {
    const html = generateBookingConfirmationHtml({ booking, service });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: booking.customer_email,
      subject: `Prenotazione confermata — ${service.name} — Armeria Palmetto`,
      html,
    });
    logger.info("Booking confirmation email sent", { bookingId: booking.id });
  } catch (error) {
    logger.error("Failed to send booking confirmation email", {
      bookingId: booking.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendBookingReminder(
  booking: Booking,
  service: BookingService
): Promise<void> {
  if (!isEmailConfigured()) {
    logger.info("Email not configured, skipping booking reminder", { bookingId: booking.id });
    return;
  }
  try {
    const html = generateBookingReminderHtml({ booking, service });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: booking.customer_email,
      subject: `Promemoria: appuntamento domani — Armeria Palmetto`,
      html,
    });
    logger.info("Booking reminder email sent", { bookingId: booking.id });
  } catch (error) {
    logger.error("Failed to send booking reminder email", {
      bookingId: booking.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendOwnerNotification(
  order: Order & { order_number: string },
  items: OrderItem[],
  ownerEmail: string,
  customerName: string,
  customerPhone?: string
): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";
    const adminUrl = `${siteUrl}/admin/orders/${order.id}`;
    const html = generateOwnerNotificationHtml({ order, items, customerName, customerPhone, adminUrl });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `🛍️ Nuovo ordine #${order.order_number} — €${order.total.toFixed(2)}${order.requires_pickup ? " [RITIRO IN NEGOZIO]" : ""}`,
      html,
    });
    logger.info("Owner notification email sent", { orderId: order.id });
  } catch (error) {
    logger.error("Failed to send owner notification email", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendShippingNotification(
  order: Order & { order_number: string },
  items: OrderItem[],
  customer: { email: string; name: string },
  trackingCode?: string | null,
  trackingUrl?: string | null
): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const html = generateShippingNotificationHtml({
      order,
      items,
      customerName: customer.name,
      trackingCode,
      trackingUrl,
    });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: `Il tuo ordine #${order.order_number} è stato spedito — Armeria Palmetto`,
      html,
    });
    logger.info("Shipping notification email sent", { orderId: order.id });
  } catch (error) {
    logger.error("Failed to send shipping notification email", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendPickupReadyNotification(
  order: Order & { order_number: string },
  items: OrderItem[],
  customer: { email: string; name: string }
): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const html = generatePickupReadyHtml({ order, items, customerName: customer.name });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: `Il tuo ordine #${order.order_number} è pronto per il ritiro — Armeria Palmetto`,
      html,
    });
    logger.info("Pickup ready email sent", { orderId: order.id });
  } catch (error) {
    logger.error("Failed to send pickup ready email", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  if (!isEmailConfigured()) {
    logger.info("Email not configured, skipping welcome email", { email });
    return;
  }
  try {
    const html = generateWelcomeHtml({ name });
    await getClient().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Benvenuto in Armeria Palmetto!",
      html,
    });
    logger.info("Welcome email sent", { email });
  } catch (error) {
    logger.error("Failed to send welcome email", {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
