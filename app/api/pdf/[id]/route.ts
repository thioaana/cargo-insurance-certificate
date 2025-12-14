import { NextRequest, NextResponse } from 'next/server';
import { getCertificate } from '@/lib/services/certificates';
import { generateCertificatePDF } from '@/lib/pdf/certificate-pdf';

// UUID v4 regex pattern for validation
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid certificate ID' },
        { status: 400 }
      );
    }

    // Get certificate with authorization check (handled in service)
    const certificate = await getCertificate(id);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = generateCertificatePDF(certificate);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${certificate.certificate_number}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    // Handle authorization errors
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
      if (error.message.includes('Not authenticated')) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
    }

    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
