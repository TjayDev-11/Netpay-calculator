import React, { useState } from 'react';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import PayeCalculator from './components/PayeCalculator';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

// Set up VFS for pdfMake with default fonts
pdfMake.vfs = pdfFonts.vfs;

function App() {
  const [results, setResults] = useState(null);
  const [basicSalary, setBasicSalary] = useState('');
  const [benefits, setBenefits] = useState('');
  const [pension, setPension] = useState('');
  const [mortgageInterest, setMortgageInterest] = useState('');
  const [medicalFund, setMedicalFund] = useState('');

  const handlePrint = () => {
    if (!results) {
      alert('Please calculate your salary first.');
      return;
    }
    window.print();
  };

  const generatePDF = () => {
    if (!results || !results.taxBreakdown) {
      console.error('No valid results available for PDF generation', { results });
      alert('Please calculate your salary first.');
      return;
    }

    try {
      console.log('Starting PDF generation with results:', results);

      const formatNumber = (num) => Number(num).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Get current date in format: "January 15, 2026"
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const docDefinition = {
        content: [
          { text: 'Net Pay Calculator Report', style: 'header' },
          { text: `Generated: ${currentDate}`, style: 'subheader' },
          { text: 'Entered Values', style: 'sectionHeader', margin: [0, 20, 0, 10] },
          {
            stack: [
              { text: `Basic Salary: KES ${formatNumber(basicSalary || 0)}`, style: 'text' },
              { text: `Benefits/Allowances: KES ${formatNumber(benefits || 0)}`, style: 'text' },
              { text: `Pension Contribution: KES ${formatNumber(pension || 0)}`, style: 'text' },
              { text: `Mortgage Interest: KES ${formatNumber(mortgageInterest || 0)}`, style: 'text' },
              { text: `Medical Fund: KES ${formatNumber(medicalFund || 0)}`, style: 'text' },
            ],
          },
          { text: 'Salary Summary', style: 'sectionHeader', margin: [0, 20, 0, 10] },
          {
            stack: [
              { text: `Gross Salary: KES ${formatNumber(results.gross)}`, style: 'text' },
              { text: `Taxable Income: KES ${formatNumber(results.taxable)}`, style: 'text' },
              { text: `Total Deductions: KES ${formatNumber(results.totalDeductions)}`, style: 'text' },
              { text: `PAYE Tax: KES ${formatNumber(results.paye)}`, style: 'text' },
              { text: `Net Pay: KES ${formatNumber(results.netPay)}`, style: 'text', color: '#15803d' },
            ],
          },
          { text: 'Detailed Deductions', style: 'sectionHeader', margin: [0, 20, 0, 10] },
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Description', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader', alignment: 'right' }],
                [{ text: 'PAYE Tax', style: 'text' }, { text: `KES ${formatNumber(results.paye)}`, style: 'text', alignment: 'right' }],
                [{ text: 'NSSF Contribution', style: 'text' }, { text: `KES ${formatNumber(results.nssf)}`, style: 'text', alignment: 'right' }],
                [{ text: 'SHIF Contribution', style: 'text' }, { text: `KES ${formatNumber(results.shif)}`, style: 'text', alignment: 'right' }],
                [{ text: 'Affordable Housing Levy', style: 'text' }, { text: `KES ${formatNumber(results.ahl)}`, style: 'text', alignment: 'right' }],
                ...(results.pension > 0 ? [[{ text: 'Pension Contribution', style: 'text' }, { text: `KES ${formatNumber(results.pension)}`, style: 'text', alignment: 'right' }]] : []),
                ...(results.mortgage > 0 ? [[{ text: 'Mortgage Interest', style: 'text' }, { text: `KES ${formatNumber(results.mortgage)}`, style: 'text', alignment: 'right' }]] : []),
                ...(results.medicalFund > 0 ? [[{ text: 'Medical Fund', style: 'text' }, { text: `KES ${formatNumber(results.medicalFund)}`, style: 'text', alignment: 'right' }]] : []),
              ],
            },
          },
          { text: 'Reliefs', style: 'sectionHeader', margin: [0, 20, 0, 10] },
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Description', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader', alignment: 'right' }],
                [{ text: 'Personal Tax Relief', style: 'text' }, { text: `KES ${formatNumber(results.personalRelief)}`, style: 'text', alignment: 'right' }],
              ],
            },
          },
          { text: 'PAYE Tax Breakdown', style: 'sectionHeader', margin: [0, 20, 0, 10] },
          {
            table: {
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Tax Band', style: 'tableHeader' },
                  { text: 'Amount', style: 'tableHeader', alignment: 'right' },
                  { text: 'Rate', style: 'tableHeader', alignment: 'right' },
                  { text: 'Tax', style: 'tableHeader', alignment: 'right' },
                ],
                ...(results.taxBreakdown?.map((band) => [
                  { text: band.range, style: 'text' },
                  { text: `KES ${formatNumber(band.amount)}`, style: 'text', alignment: 'right' },
                  { text: band.rate, style: 'text', alignment: 'right' },
                  { text: `KES ${formatNumber(band.tax)}`, style: 'text', alignment: 'right' },
                ]) || []),
              ],
            },
          },
        ],
        footer: {
          text: '© 2025 Net Salary Calculator. Rates based on current KRA tax bands.',
          style: 'footer',
          alignment: 'center',
          margin: [0, 10],
        },
        styles: {
          header: { fontSize: 18, bold: true, color: '#0F0E47', margin: [0, 0, 0, 10] },
          subheader: { fontSize: 12, color: '#272757' },
          sectionHeader: { fontSize: 14, bold: true, color: '#0F0E47', margin: [0, 10] },
          tableHeader: { fontSize: 12, bold: true, fillColor: '#8686AC', color: '#0F0E47' },
          text: { fontSize: 12, color: '#0F0E47' },
          footer: { fontSize: 10, color: '#272757' },
        },
        pageMargins: [40, 40, 40, 60],
      };

      console.log('Creating PDF with docDefinition:', docDefinition);
      pdfMake.createPdf(docDefinition).download(`PayeReport_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF download triggered');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please check the console for errors or try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3e9eacf] to-[#7d7474] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(134, 134, 172, 0.3), transparent 70%), radial-gradient(circle at 80% 70%, rgba(80, 80, 129, 0.3), transparent 70%)',
          filter: 'blur(50px)',
        }}
      ></div>
      <div className="relative z-10">
        <Navbar handlePrint={handlePrint} generatePDF={generatePDF} results={results} />
        <PayeCalculator
          setResults={setResults}
          results={results}
          basicSalary={basicSalary}
          setBasicSalary={setBasicSalary}
          benefits={benefits}
          setBenefits={setBenefits}
          pension={pension}
          setPension={setPension}
          mortgageInterest={mortgageInterest}
          setMortgageInterest={setMortgageInterest}
          medicalFund={medicalFund}
          setMedicalFund={setMedicalFund}
          handlePrint={handlePrint}
          generatePDF={generatePDF}
        />
        <Footer />
      </div>
    </div>
  );
}

export default App;