/**
 * Generate PDF using Supabase Edge Function
 * @param request - The quote request object
 * @param preview - Whether to preview the PDF in browser or download it
 */
export const generateQuotePDFEdge = async (request: any, preview = false) => {
  try {
    // Call the Supabase edge function directly and get the blob response
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quote-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteId: request.id
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
    }

    // Get the PDF as a blob directly from the response
    const pdfBlob = await response.blob();

    if (preview) {
      // For preview, open in new window
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
      // For download, trigger download
      const quoteNumber = request.id.slice(0, 8).toUpperCase();
      const customerName = request.customer_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
      const date = new Date().toISOString().split('T')[0];
      const filename = `BAZ_Quote_${quoteNumber}_${customerName}_${date}.pdf`;

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

  } catch (error) {
    console.error('Error generating PDF with edge function:', error);
    throw error;
  }
};
