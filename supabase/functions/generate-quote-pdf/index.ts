// supabase/functions/generate-quote-pdf/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// PDF generation libraries for Deno
import { Document, Page, Text, View, Image, StyleSheet, pdf } from "https://esm.sh/@react-pdf/renderer@3.1.12"
import React from "https://esm.sh/react@18.2.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define styles (same as your original)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#23b478',
    height: 80,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  companyTitle: {
    color: '#23b478',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  companySubtitle: {
    color: '#374151',
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  companyContact: {
    color: '#666666',
    fontSize: 8,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#23b478',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
  },
  customerInfoBox: {
    borderLeftColor: '#23b478',
  },
  quoteInfoBox: {
    borderLeftColor: '#059669',
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#23b478',
  },
  infoBoxTitleGreen: {
    color: '#059669',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
    color: '#374151',
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
    fontSize: 7,
    textTransform: 'uppercase',
  },
  tableSection: {
    flex: 1,
    marginBottom: 15,
  },
  tableSectionTitle: {
    color: '#23b478',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#23b478',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    textAlign: 'left',
  },
  tableHeaderCellCenter: {
    textAlign: 'center',
  },
  tableHeaderCellRight: {
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 40,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    fontSize: 9,
    color: '#374151',
    flexWrap: 'wrap',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  productName: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  productType: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
  },
  productNotes: {
    fontSize: 7,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  unitPrice: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#23b478',
  },
  summarySection: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  notesSection: {
    flex: 1,
  },
  notesBox: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  notesTitle: {
    color: '#d97706',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  notesText: {
    color: '#92400e',
    fontSize: 9,
    lineHeight: 1.4,
  },
  summaryBox: {
    width: 200,
    backgroundColor: '#23b478',
    color: '#ffffff',
    padding: 15,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    marginBottom: 6,
    fontSize: 10,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'white',
  },
  noItemsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: 10,
    paddingVertical: 20,
  },
})

// Define column widths
const columnWidths = {
  productDetails: '35%',
  specifications: '25%',
  quantity: '10%',
  unitPrice: '15%',
  total: '15%',
}

// Quote PDF Document Component
const QuoteDocument = ({ quoteRequest }: { quoteRequest: any }) => {
  const items = quoteRequest.quote_items || []
  const ITEMS_PER_FIRST_PAGE = 8
  const ITEMS_PER_OTHER_PAGE = 12
  const ITEMS_PER_LAST_PAGE = 8

  // Smart pagination logic
  const pages = []
  let remainingItems = [...items]
  let pageIndex = 0

  if (items.length === 0) {
    pages.push({ items: [], isFirst: true, isLast: true })
  } else {
    while (remainingItems.length > 0) {
      const isFirst = pageIndex === 0
      const isLast = remainingItems.length <= (isFirst ? ITEMS_PER_FIRST_PAGE : ITEMS_PER_OTHER_PAGE)

      let itemsForThisPage
      if (isFirst && isLast) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_LAST_PAGE)
      } else if (isFirst) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_FIRST_PAGE)
      } else if (isLast) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_LAST_PAGE)
      } else {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_OTHER_PAGE)
      }

      pages.push({
        items: remainingItems.splice(0, itemsForThisPage),
        isFirst,
        isLast
      })

      pageIndex++
    }
  }

  const formatSpecs = (specs: any) => {
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs)
      } catch (e) {
        return specs?.substring(0, 80) + (specs?.length > 80 ? '...' : '') || 'N/A'
      }
    }

    if (specs && typeof specs === 'object') {
      return Object.entries(specs).slice(0, 3).map(([key, value]) =>
        `${key}: ${String(value).substring(0, 20)}${String(value).length > 20 ? '...' : ''}`
      ).join('\n')
    }

    return 'N/A'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return React.createElement(Document, {},
    pages.map((page, pageIndex) =>
      React.createElement(Page, { key: pageIndex, size: "A4", style: styles.page },
        // Header
        React.createElement(View, { style: styles.header },
          React.createElement(View, { style: styles.headerLeft },
            React.createElement(Image, {
              src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // placeholder
              style: { width: 'auto', height: 50, marginBottom: 8 }
            })
          ),
          React.createElement(View, { style: styles.headerCenter },
            React.createElement(Text, { style: styles.companyTitle }, "BAZ INTL. INDUSTRY CO."),
            React.createElement(Text, { style: styles.companySubtitle }, "Pioneers in commercial steel industry since 1978"),
            React.createElement(Text, { style: styles.companyContact }, "bazsteel.com | 920018077 | sales@bazsteel.com")
          ),
          React.createElement(View, { style: styles.headerRight },
            React.createElement(Image, {
              src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // placeholder
              style: { width: 70, height: 'auto', borderRadius: 4 }
            })
          )
        ),

        // Quote Details (only on first page)
        page.isFirst && React.createElement(View, {},
          React.createElement(Text, { style: styles.quoteTitle },
            `QUOTATION #${quoteRequest.id.slice(0, 8).toUpperCase()}`
          ),

          React.createElement(View, { style: styles.infoGrid },
            React.createElement(View, { style: [styles.infoBox, styles.customerInfoBox] },
              React.createElement(Text, { style: styles.infoBoxTitle }, "Customer Information"),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Name:"),
                React.createElement(Text, {}, quoteRequest.customer_name || 'N/A')
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Email:"),
                React.createElement(Text, {}, quoteRequest.customer_email || 'N/A')
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Phone:"),
                React.createElement(Text, {}, quoteRequest.customer_phone || 'N/A')
              ),
              quoteRequest.customer_company && React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Company:"),
                React.createElement(Text, {}, quoteRequest.customer_company)
              ),
              quoteRequest.project_name && React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Project:"),
                React.createElement(Text, {}, quoteRequest.project_name)
              )
            ),

            React.createElement(View, { style: [styles.infoBox, styles.quoteInfoBox] },
              React.createElement(Text, { style: [styles.infoBoxTitle, styles.infoBoxTitleGreen] }, "Quote Information"),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Date:"),
                React.createElement(Text, {}, formatDate(quoteRequest.created_at))
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Valid Until:"),
                React.createElement(Text, {},
                  quoteRequest.quote_response[0]?.expires_at
                    ? formatDate(quoteRequest.quote_response[0].expires_at)
                    : 'N/A'
                )
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Status:"),
                React.createElement(Text, { style: styles.statusBadge }, quoteRequest.status || 'Pending')
              ),
              React.createElement(View, { style: styles.infoRow },
                React.createElement(Text, { style: styles.infoLabel }, "Validity:"),
                React.createElement(Text, {}, `${quoteRequest.quote_response[0]?.validity_period || 'N/A'} days`)
              )
            )
          )
        ),

        // Quote Items Table
        React.createElement(View, { style: styles.tableSection },
          React.createElement(Text, { style: styles.tableSectionTitle },
            pageIndex === 0 ? 'Detailed Quote Items' : `Quote Items (Continued - Page ${pageIndex + 1})`
          ),

          React.createElement(View, { style: styles.table },
            // Table Header
            React.createElement(View, { style: styles.tableHeader },
              React.createElement(Text, { style: [styles.tableHeaderCell, { width: columnWidths.productDetails }] }, "Product Details"),
              React.createElement(Text, { style: [styles.tableHeaderCell, { width: columnWidths.specifications }] }, "Specifications"),
              React.createElement(Text, { style: [styles.tableHeaderCell, styles.tableHeaderCellCenter, { width: columnWidths.quantity }] }, "Qty"),
              React.createElement(Text, { style: [styles.tableHeaderCell, styles.tableHeaderCellRight, { width: columnWidths.unitPrice }] }, "Unit Price"),
              React.createElement(Text, { style: [styles.tableHeaderCell, styles.tableHeaderCellRight, { width: columnWidths.total }] }, "Total")
            ),

            // Table Body
            page.items.length > 0 ? (
              page.items.map((item: any, index: number) =>
                React.createElement(View, { key: index, style: [styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowEven] : [])] },
                  React.createElement(View, { style: [styles.tableCell, { width: columnWidths.productDetails }] },
                    React.createElement(Text, { style: styles.productName }, item.product?.name || 'Unknown Product'),
                    item.product?.type && React.createElement(Text, { style: styles.productType },
                      Array.isArray(item.product.type)
                        ? `Types: ${item.product.type.join(', ')}`
                        : `Type: ${item.product.type}`
                    ),
                    item.notes && React.createElement(Text, { style: styles.productNotes },
                      `${item.notes.replace(/"/g, '').substring(0, 100)}${item.notes.length > 100 ? '...' : ''}`
                    )
                  ),
                  React.createElement(Text, { style: [styles.tableCell, { width: columnWidths.specifications }] }, formatSpecs(item.requested_specs)),
                  React.createElement(Text, { style: [styles.tableCell, styles.tableCellCenter, styles.unitPrice, { width: columnWidths.quantity }] }, item.quantity),
                  React.createElement(Text, { style: [styles.tableCell, styles.tableCellRight, styles.unitPrice, { width: columnWidths.unitPrice }] }, (item.unit_price || 0).toFixed(2)),
                  React.createElement(Text, { style: [styles.tableCell, styles.tableCellRight, styles.totalPrice, { width: columnWidths.total }] }, (item.total_price || 0).toFixed(2))
                )
              )
            ) : (
              React.createElement(View, { style: styles.tableRow },
                React.createElement(Text, { style: [styles.noItemsText, { width: '100%' }] }, "No items found")
              )
            )
          )
        ),

        // Summary Section (only on last page)
        page.isLast && React.createElement(View, { style: styles.summarySection },
          React.createElement(View, { style: styles.notesSection },
            quoteRequest.quote_response[0]?.response_notes && React.createElement(View, { style: styles.notesBox },
              React.createElement(Text, { style: styles.notesTitle }, "Special Notes & Terms"),
              React.createElement(Text, { style: styles.notesText }, quoteRequest.quote_response[0].response_notes)
            )
          ),

          React.createElement(View, { style: styles.summaryBox },
            React.createElement(Text, { style: styles.summaryTitle }, "Quote Summary"),
            React.createElement(View, { style: styles.summaryRow },
              React.createElement(Text, {}, "Subtotal:"),
              React.createElement(Text, {}, (quoteRequest.quote_response[0]?.total_amount || 0).toFixed(2))
            ),
            React.createElement(View, { style: styles.summaryRow },
              React.createElement(Text, {}, "Tax (if applicable):"),
              React.createElement(Text, {}, "TBD")
            ),
            React.createElement(View, { style: styles.summaryTotal },
              React.createElement(Text, {}, "TOTAL:"),
              React.createElement(Text, {}, (quoteRequest.quote_response[0]?.total_amount || 0).toFixed(2))
            )
          )
        )
      )
    )
  )
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get quote ID from request
    const { quoteId } = await req.json()

    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: 'Quote ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Query the quote data with all related information
    const { data: quoteData, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        quote_items (
          *,
          product:products (*)
        ),
        quote_response (*)
      `)
      .eq('id', quoteId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch quote data', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!quoteData) {
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate PDF
    const quoteDocument = React.createElement(QuoteDocument, { quoteRequest: quoteData })
    const pdfBuffer = await pdf(quoteDocument).toBuffer()

    // Create filename
    const quoteNumber = quoteData.id.slice(0, 8).toUpperCase()
    const customerName = quoteData.customer_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer'
    const date = new Date().toISOString().split('T')[0]
    const filename = `BAZ_Quote_${quoteNumber}_${customerName}_${date}.pdf`

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
