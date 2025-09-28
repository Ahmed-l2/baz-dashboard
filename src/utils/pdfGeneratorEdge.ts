/**
 * Generate PDF using Supabase Edge Function
 * @param request - The quote request object
 * @param preview - Whether to preview the PDF in browser or download it
 * @param language - Optional language override ('en' or 'ar')
 */

import i18n from "../i18n";

export const generateQuotePDFEdge = async (
    request: any, 
    preview = false, 
    language?: 'en' | 'ar'
) => {
    const lang = language || i18n.language; // Use override or current language
    
    try {
        // Validate language parameter
        const validLang = lang === 'ar' ? 'ar' : 'en';
        

        
        // Call the Supabase edge function with language parameter
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quote-pdf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quoteId: request.id,
                language: validLang
            }),
        });

        console.log('PDF generation response status:', response.status);
        
        if (!response.ok) {
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = JSON.stringify(errorData);
            } catch (e) {
                errorDetails = await response.text();
            }
            
            console.error('PDF generation failed with details:', {
                status: response.status,
                statusText: response.statusText,
                details: errorDetails
            });
            
            throw new Error(`PDF generation failed: ${response.status} ${response.statusText}. ${errorDetails}`);
        }

        // Check if response is PDF
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
            const responseText = await response.text();
            console.error('Unexpected response type:', contentType, 'Response:', responseText);
            throw new Error(`Expected PDF but got: ${contentType}`);
        }

        // Get the PDF as a blob directly from the response
        const pdfBlob = await response.blob();
        
        if (pdfBlob.size === 0) {
            throw new Error('Generated PDF is empty');
        }

        console.log('PDF generated successfully, size:', pdfBlob.size, 'bytes');

        // Create filename with language indicator
        const quoteNumber = request.id.slice(0, 8).toUpperCase();
        const customerName = request.customer_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
        const date = new Date().toISOString().split('T')[0];
        const langSuffix = validLang === 'ar' ? '_AR' : '_EN';
        const filename = `BAZ_Quote_${quoteNumber}_${customerName}_${date}${langSuffix}.pdf`;

        if (preview) {
            // For preview, open in new window
            const url = URL.createObjectURL(pdfBlob);
            const previewWindow = window.open(url, '_blank');
            
            if (previewWindow) {
                previewWindow.onbeforeunload = () => {
                    URL.revokeObjectURL(url);
                    console.log('Preview window closed, URL revoked');
                };
                // Clean up after 30 seconds if window is still open
                setTimeout(() => {
                    if (!previewWindow.closed) {
                        URL.revokeObjectURL(url);
                        console.log('Preview URL cleaned up after timeout');
                    }
                }, 30000);
            } else {
                // Fallback if popup is blocked - download instead
                console.log('Popup blocked, falling back to download');
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } else {
            // For download, trigger download
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up after a short delay to ensure download starts
            setTimeout(() => {
                URL.revokeObjectURL(url);
                console.log('Download URL revoked');
            }, 1000);
        }

        return pdfBlob;

    } catch (error) {
        console.error('Error in generateQuotePDFEdge:', {
            error,
            quoteId: request.id,
            language: lang
        });
        throw error;
    }
};