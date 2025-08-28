// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';

// Define styles
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
    display: 'table' as any,
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
});

// Define column widths (as percentages)
const columnWidths = {
  productDetails: '35%',
  specifications: '25%',
  quantity: '10%',
  unitPrice: '15%',
  total: '15%',
};

// Quote PDF Document Component
const QuoteDocument = ({ quoteRequest }: { quoteRequest: any }) => {
  const items = quoteRequest.quote_items || [];
  const ITEMS_PER_FIRST_PAGE = 8;
  const ITEMS_PER_OTHER_PAGE = 12;
  const ITEMS_PER_LAST_PAGE = 8;

  // Smart pagination
  const pages = [];
  let remainingItems = [...items];
  let pageIndex = 0;

  if (items.length === 0) {
    pages.push({ items: [], isFirst: true, isLast: true });
  } else {
    while (remainingItems.length > 0) {
      const isFirst = pageIndex === 0;
      const isLast = remainingItems.length <= (isFirst ? ITEMS_PER_FIRST_PAGE : ITEMS_PER_OTHER_PAGE);

      let itemsForThisPage;
      if (isFirst && isLast) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_LAST_PAGE);
      } else if (isFirst) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_FIRST_PAGE);
      } else if (isLast) {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_LAST_PAGE);
      } else {
        itemsForThisPage = Math.min(remainingItems.length, ITEMS_PER_OTHER_PAGE);
      }

      pages.push({
        items: remainingItems.splice(0, itemsForThisPage),
        isFirst,
        isLast
      });

      pageIndex++;
    }
  }

  const formatSpecs = (specs: any) => {
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch (e) {
        return specs?.substring(0, 80) + (specs?.length > 80 ? '...' : '') || 'N/A';
      }
    }

    if (specs && typeof specs === 'object') {
      return Object.entries(specs).slice(0, 3).map(([key, value]) =>
        `${key}: ${String(value).substring(0, 20)}${String(value).length > 20 ? '...' : ''}`
      ).join('\n');
    }

    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Document>
      {pages.map((page, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                src="/assets/logo/baz-logo-bg.jpg"
                style={{ width: 'auto', height: 50 , marginBottom: 8 }}
              />
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.companyTitle}>BAZ INTL. INDUSTRY CO.</Text>
              <Text style={styles.companySubtitle}>Pioneers in commercial steel industry since 1978</Text>
              <Text style={styles.companyContact}>bazsteel.com | 920018077 | sales@bazsteel.com</Text>
            </View>

            <View style={styles.headerRight}>
              <Image
              src="/assets/logo/saudi-made.jpg"
              style={{ width: 70, height: 'auto', borderRadius: 4 }}
              />
            </View>
          </View>

          {/* Quote Details (only on first page) */}
          {page.isFirst && (
            <View>
              <Text style={styles.quoteTitle}>
                QUOTATION #{quoteRequest.id.slice(0, 8).toUpperCase()}
              </Text>

              <View style={styles.infoGrid}>
                <View style={[styles.infoBox, styles.customerInfoBox]}>
                  <Text style={styles.infoBoxTitle}>Customer Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text>{quoteRequest.customer_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text>{quoteRequest.customer_email || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text>{quoteRequest.customer_phone || 'N/A'}</Text>
                  </View>
                  {quoteRequest.customer_company && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Company:</Text>
                      <Text>{quoteRequest.customer_company}</Text>
                    </View>
                  )}
                  {quoteRequest.project_name && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Project:</Text>
                      <Text>{quoteRequest.project_name}</Text>
                    </View>
                  )}
                </View>

                <View style={[styles.infoBox, styles.quoteInfoBox]}>
                  <Text style={[styles.infoBoxTitle, styles.infoBoxTitleGreen]}>Quote Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text>{formatDate(quoteRequest.created_at)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Valid Until:</Text>
                    <Text>
                      {quoteRequest.quote_response[0]?.expires_at
                        ? formatDate(quoteRequest.quote_response[0].expires_at)
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status:</Text>
                    <Text style={styles.statusBadge}>{quoteRequest.status || 'Pending'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Validity:</Text>
                    <Text>{quoteRequest.quote_response[0]?.validity_period || 'N/A'} days</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Quote Items Table */}
          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>
              {pageIndex === 0 ? 'Detailed Quote Items' : `Quote Items (Continued - Page ${pageIndex + 1})`}
            </Text>

            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: columnWidths.productDetails }]}>
                  Product Details
                </Text>
                <Text style={[styles.tableHeaderCell, { width: columnWidths.specifications }]}>
                  Specifications
                </Text>
                <Text style={[styles.tableHeaderCell, styles.tableHeaderCellCenter, { width: columnWidths.quantity }]}>
                  Qty
                </Text>
                <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight, { width: columnWidths.unitPrice }]}>
                  Unit Price
                </Text>
                <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight, { width: columnWidths.total }]}>
                  Total
                </Text>
              </View>

              {/* Table Body */}
              {page.items.length > 0 ? (
                page.items.map((item: any, index: number) => (
                  <View key={index} style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowEven] : [])]}>
                    <View style={[styles.tableCell, { width: columnWidths.productDetails }]}>
                      <Text style={styles.productName}>{item.product?.name || 'Unknown Product'}</Text>
                      {item.product?.type && (
                        <Text style={styles.productType}>
                          {Array.isArray(item.product.type)
                            ? `Types: ${item.product.type.join(', ')}`
                            : `Type: ${item.product.type}`
                          }
                        </Text>
                      )}
                      {item.notes && (
                        <Text style={styles.productNotes}>
                          {item.notes.replace(/"/g, '').substring(0, 100)}
                          {item.notes.length > 100 ? '...' : ''}
                        </Text>
                      )}
                    </View>

                    <Text style={[styles.tableCell, { width: columnWidths.specifications }]}>
                      {formatSpecs(item.requested_specs)}
                    </Text>

                    <Text style={[styles.tableCell, styles.tableCellCenter, styles.unitPrice, { width: columnWidths.quantity }]}>
                      {item.quantity}
                    </Text>

                    <Text style={[styles.tableCell, styles.tableCellRight, styles.unitPrice, { width: columnWidths.unitPrice }]}>
                      {(item.unit_price || 0).toFixed(2)}
                    </Text>

                    <Text style={[styles.tableCell, styles.tableCellRight, styles.totalPrice, { width: columnWidths.total }]}>
                      {(item.total_price || 0).toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.noItemsText, { width: '100%' }]}>
                    No items found
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Summary Section (only on last page) */}
          {page.isLast && (
            <View style={styles.summarySection}>
              <View style={styles.notesSection}>
                {quoteRequest.quote_response[0]?.response_notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesTitle}>Special Notes & Terms</Text>
                    <Text style={styles.notesText}>
                      {quoteRequest.quote_response[0].response_notes}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Quote Summary</Text>

                <View style={styles.summaryRow}>
                  <Text>Subtotal:</Text>
                  <Text>{(quoteRequest.quote_response[0]?.total_amount || 0).toFixed(2)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text>Tax (if applicable):</Text>
                  <Text>TBD</Text>
                </View>

                <View style={styles.summaryTotal}>
                  <Text>TOTAL:</Text>
                  <Text>{(quoteRequest.quote_response[0]?.total_amount || 0).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
};

// Main function to generate the PDF
export const generateQuotePDF = async (quoteRequest: any, preview = false) => {
  const quoteDocument = <QuoteDocument quoteRequest={quoteRequest} />;

  if (preview) {
    // For preview, generate blob and open in new window
    const blob = await pdf(quoteDocument).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } else {
    // For download, generate blob and trigger download
    const blob = await pdf(quoteDocument).toBlob();
    const quoteNumber = quoteRequest.id.slice(0, 8).toUpperCase();
    const customerName = quoteRequest.customer_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
    const date = new Date().toISOString().split('T')[0];
    const filename = `BAZ_Quote_${quoteNumber}_${customerName}_${date}.pdf`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
};
