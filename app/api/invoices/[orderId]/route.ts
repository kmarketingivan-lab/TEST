import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getOrderById } from "@/lib/dal/orders";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
    }

    // Auth: only owner or admin
    if (order.user_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const formatPrice = (n: number) =>
      new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

    const shippingAddr = order.shipping_address as {
      street?: string;
      city?: string;
      zip?: string;
      province?: string;
      country?: string;
    } | null;

    // Generate PDF
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    // Company header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Armeria Palmetto", 20, 25);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("P.IVA: IT01234567890", 20, 32);
    doc.text("Via Roma 1, 00100 Roma (RM), Italia", 20, 37);

    // Invoice title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FATTURA", 140, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`N. ${order.order_number}`, 140, 32);
    doc.text(`Data: ${new Date(order.created_at).toLocaleDateString("it-IT")}`, 140, 38);

    // Separator line
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);

    // Customer info
    let y = 55;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Intestato a:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(order.email, 20, y);

    if (shippingAddr) {
      y += 5;
      if (shippingAddr.street) doc.text(shippingAddr.street, 20, y);
      y += 5;
      const cityLine = [shippingAddr.zip, shippingAddr.city, shippingAddr.province ? `(${shippingAddr.province})` : ""]
        .filter(Boolean)
        .join(" ");
      if (cityLine) doc.text(cityLine, 20, y);
      y += 5;
      if (shippingAddr.country) doc.text(shippingAddr.country, 20, y);
    }

    // Items table
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 4, 170, 8, "F");
    doc.text("Articolo", 22, y);
    doc.text("Qty", 120, y, { align: "center" });
    doc.text("Prezzo unit.", 145, y, { align: "right" });
    doc.text("Totale", 188, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    y += 8;

    for (const item of order.order_items) {
      if (y > 260) {
        doc.addPage();
        y = 25;
      }

      let itemName = item.product_name;
      if (item.variant_name) itemName += ` (${item.variant_name})`;

      // Truncate long names
      if (itemName.length > 50) itemName = itemName.substring(0, 47) + "...";

      doc.text(itemName, 22, y);
      doc.text(String(item.quantity), 120, y, { align: "center" });
      doc.text(formatPrice(item.unit_price), 145, y, { align: "right" });
      doc.text(formatPrice(item.total_price), 188, y, { align: "right" });
      y += 6;
    }

    // Totals section
    y += 5;
    doc.setDrawColor(200);
    doc.line(120, y, 190, y);
    y += 8;

    doc.text("Subtotale:", 130, y);
    doc.text(formatPrice(order.subtotal), 188, y, { align: "right" });
    y += 6;

    if (order.discount > 0) {
      doc.text("Sconto:", 130, y);
      doc.text(`-${formatPrice(order.discount)}`, 188, y, { align: "right" });
      y += 6;
    }

    doc.text("IVA (22%):", 130, y);
    doc.text(formatPrice(order.tax), 188, y, { align: "right" });
    y += 6;

    if (order.shipping > 0) {
      doc.text("Spedizione:", 130, y);
      doc.text(formatPrice(order.shipping), 188, y, { align: "right" });
      y += 6;
    }

    y += 2;
    doc.setDrawColor(0);
    doc.line(120, y, 190, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTALE:", 130, y);
    doc.text(formatPrice(order.total), 188, y, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128);
    doc.text("Documento generato automaticamente da Armeria Palmetto", 105, 285, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="fattura-${order.order_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Invoice generation error:", err);
    return NextResponse.json(
      { error: "Errore nella generazione della fattura" },
      { status: 500 }
    );
  }
}
