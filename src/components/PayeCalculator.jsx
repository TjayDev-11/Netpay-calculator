import React, { useState } from 'react';

const PayeCalculator = ({
  setResults,
  results,
  basicSalary,
  setBasicSalary,
  benefits,
  setBenefits,
  pension,
  setPension,
  mortgageInterest,
  setMortgageInterest,
  medicalFund,
  setMedicalFund,
  handlePrint,
  generatePDF,
}) => {
  const [errors, setErrors] = useState({
    basicSalary: '',
    benefits: '',
    pension: '',
    mortgageInterest: '',
    medicalFund: '',
  });
  const [globalError, setGlobalError] = useState('');

  const formatNumber = (num) => Number(num).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleInputChange = (value, setter, field) => {
    if (value === '') {
      setter('');
      setErrors((prev) => ({ ...prev, [field]: '' }));
    } else if (/^[0-9]+(\.[0-9]{0,2})?$/.test(value) && Number(value) <= 100000000) {
      setter(value);
      setErrors((prev) => ({ ...prev, [field]: '' }));
    } else {
      const errorMessage = 'Enter a positive number up to KES 100M (max 2 decimals)';
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      console.error({ field, value, message: errorMessage });
    }
  };

  const calculateNSSF = (gross) => {
    const tier1Limit = 8000;
    const tier2Limit = 72000;
    if (gross <= tier1Limit) {
      return Number((gross * 0.06).toFixed(2));
    }
    const tier1Contribution = 480;
    const pensionableEarnings = Math.min(gross, tier2Limit) - tier1Limit;
    const tier2Contribution = Number((pensionableEarnings * 0.06).toFixed(2));
    return Number((tier1Contribution + tier2Contribution).toFixed(2));
  };

  const calculateSHIF = (gross) => {
    return Number(Math.max(gross * 0.0275, 300).toFixed(2));
  };

  const calculateTax = () => {
    const basic = Number.parseFloat(basicSalary) || 0;
    const benefitsVal = Number.parseFloat(benefits) || 0;
    const pensionVal = Number.parseFloat(pension) || 0;
    const mortgageVal = Number.parseFloat(mortgageInterest) || 0;
    const medicalVal = Number.parseFloat(medicalFund) || 0;

    if (Object.values(errors).some((error) => error) || basic <= 0 || isNaN(basic)) {
      const errorMessage = basic <= 0 || isNaN(basic) ? 'Please enter a valid Basic Salary' : 'Please fix input errors';
      setGlobalError(errorMessage);
      setResults(null);
      console.error({
        message: errorMessage,
        inputs: { basicSalary, benefits, pension, mortgageInterest, medicalFund },
        errors,
      });
      return;
    }

    setGlobalError('');
    const gross = basic + benefitsVal;
    const nssf = calculateNSSF(gross);
    const shif = calculateSHIF(gross);
    const ahl = Number((gross * 0.015).toFixed(2));
    const pensionDeduction = Math.min(pensionVal, 30000);
    const mortgageDeduction = Math.min(mortgageVal, 25000);
    const medicalFundDeduction = Math.min(medicalVal, 15000);

    const taxable = gross - nssf - shif - ahl - pensionDeduction - mortgageDeduction - medicalFundDeduction;

    let paye = 0;
    let taxBreakdown = [];

    if (taxable <= 24000) {
      paye = Number((taxable * 0.1).toFixed(2));
      taxBreakdown.push({ range: 'Up to KES 24,000', amount: taxable, rate: '10%', tax: paye });
    } else if (taxable <= 32333) {
      const firstBand = Number((24000 * 0.1).toFixed(2));
      const secondBand = Number(((taxable - 24000) * 0.25).toFixed(2));
      paye = Number((firstBand + secondBand).toFixed(2));
      taxBreakdown.push({ range: 'Up to KES 24,000', amount: 24000, rate: '10%', tax: firstBand });
      taxBreakdown.push({ range: 'KES 24,001 - 32,333', amount: taxable - 24000, rate: '25%', tax: secondBand });
    } else if (taxable <= 500000) {
      const firstBand = Number((24000 * 0.1).toFixed(2));
      const secondBand = Number((8333 * 0.25).toFixed(2));
      const thirdBand = Number(((taxable - 32333) * 0.3).toFixed(2));
      paye = Number((firstBand + secondBand + thirdBand).toFixed(2));
      taxBreakdown.push({ range: 'Up to KES 24,000', amount: 24000, rate: '10%', tax: firstBand });
      taxBreakdown.push({ range: 'KES 24,001 - 32,333', amount: 8333, rate: '25%', tax: secondBand });
      taxBreakdown.push({ range: 'KES 32,334 - 500,000', amount: taxable - 32333, rate: '30%', tax: thirdBand });
    } else if (taxable <= 800000) {
      const firstBand = Number((24000 * 0.1).toFixed(2));
      const secondBand = Number((8333 * 0.25).toFixed(2));
      const thirdBand = Number((467667 * 0.3).toFixed(2));
      const fourthBand = Number(((taxable - 500000) * 0.325).toFixed(2));
      paye = Number((firstBand + secondBand + thirdBand + fourthBand).toFixed(2));
      taxBreakdown.push({ range: 'Up to KES 24,000', amount: 24000, rate: '10%', tax: firstBand });
      taxBreakdown.push({ range: 'KES 24,001 - 32,333', amount: 8333, rate: '25%', tax: secondBand });
      taxBreakdown.push({ range: 'KES 32,334 - 500,000', amount: 467667, rate: '30%', tax: thirdBand });
      taxBreakdown.push({ range: 'KES 500,001 - 800,000', amount: taxable - 500000, rate: '32.5%', tax: fourthBand });
    } else {
      const firstBand = Number((24000 * 0.1).toFixed(2));
      const secondBand = Number((8333 * 0.25).toFixed(2));
      const thirdBand = Number((467667 * 0.3).toFixed(2));
      const fourthBand = Number((300000 * 0.325).toFixed(2));
      const fifthBand = Number(((taxable - 800000) * 0.35).toFixed(2));
      paye = Number((firstBand + secondBand + thirdBand + fourthBand + fifthBand).toFixed(2));
      taxBreakdown.push({ range: 'Up to KES 24,000', amount: 24000, rate: '10%', tax: firstBand });
      taxBreakdown.push({ range: 'KES 24,001 - 32,333', amount: 8333, rate: '25%', tax: secondBand });
      taxBreakdown.push({ range: 'KES 32,334 - 500,000', amount: 467667, rate: '30%', tax: thirdBand });
      taxBreakdown.push({ range: 'KES 500,001 - 800,000', amount: 300000, rate: '32.5%', tax: fourthBand });
      taxBreakdown.push({ range: 'Above KES 800,000', amount: taxable - 800000, rate: '35%', tax: fifthBand });
    }

    const personalRelief = 2400;
    const finalPaye = Number(Math.max(paye - personalRelief, 0).toFixed(2));
    const totalDeductions = Number((finalPaye + nssf + shif + ahl + pensionDeduction + mortgageDeduction + medicalFundDeduction).toFixed(2));
    const netPay = Number((gross - totalDeductions).toFixed(2));

    setResults({
      gross,
      taxable,
      paye: finalPaye,
      nssf,
      shif,
      ahl,
      pension: pensionDeduction,
      mortgage: mortgageDeduction,
      medicalFund: medicalFundDeduction,
      netPay,
      totalDeductions,
      personalRelief,
      taxBreakdown,
    });
  };

  const handleReset = () => {
    setBasicSalary('');
    setBenefits('');
    setPension('');
    setMortgageInterest('');
    setMedicalFund('');
    setResults(null);
    setErrors({
      basicSalary: '',
      benefits: '',
      pension: '',
      mortgageInterest: '',
      medicalFund: '',
    });
    setGlobalError('');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="flex-grow py-8 md:py-12 font-roboto">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-content, #print-content * {
              visibility: visible;
            }
            #print-content {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-sizing: border-box;
              background: white;
              font-family: 'Roboto', sans-serif;
            }
            header, .input-section, button, #results-section, footer {
              display: none !important;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
          .tax-breakdown-table th, .tax-breakdown-table td {
            font-size: 0.75rem;
            padding: 0.5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .tax-breakdown-table th:nth-child(1), .tax-breakdown-table td:nth-child(1) {
            max-width: 120px;
          }
          .tax-breakdown-table th:nth-child(2), .tax-breakdown-table td:nth-child(2) {
            max-width: 100px;
          }
          .tax-breakdown-table th:nth-child(3), .tax-breakdown-table td:nth-child(3) {
            max-width: 60px;
          }
          .tax-breakdown-table th:nth-child(4), .tax-breakdown-table td:nth-child(4) {
            max-width: 80px;
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 md:p-8 input-section bg-gradient-to-br from-[#cfd9da] to-[#69bdbc]">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E47] mb-6 tracking-tight">Salary Details</h2>
            <div className="space-y-5">
              {[
                { label: 'Basic Salary (KES)', value: basicSalary, setter: setBasicSalary, field: 'basicSalary' },
                { label: 'Benefits/Allowances (KES)', value: benefits, setter: setBenefits, field: 'benefits' },
                { label: 'Pension Contribution (KES)', value: pension, setter: setPension, field: 'pension' },
                { label: 'Mortgage Interest (KES)', value: mortgageInterest, setter: setMortgageInterest, field: 'mortgageInterest' },
                { label: 'Medical Fund (KES)', value: medicalFund, setter: setMedicalFund, field: 'medicalFund' },
              ].map(({ label, value, setter, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-[#0F0E47] mb-2">{label}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#272757]">KES</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={value}
                      onChange={(e) => handleInputChange(e.target.value, setter, field)}
                      className="pl-12 w-full p-3 border border-[#505081] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#272757] focus:border-transparent bg-white transition-all duration-300 text-[#0F0E47] shadow-sm hover:shadow-md"
                      placeholder="0.00"
                    />
                  </div>
                  {errors[field] && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors[field]}</p>}
                </div>
              ))}
              {globalError && <p className="text-red-500 text-xs mt-2 animate-fade-in">{globalError}</p>}
              <div className="flex flex-row space-x-4 pt-2">
                <button
                  onClick={calculateTax}
                  className="flex-1 bg-[#272757] text-white py-3 px-4 rounded-lg hover:bg-[#0F0E47] transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium transform hover:-translate-y-0.5"
                >
                  Calculate Net Pay
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-[#505081] text-white py-3 px-4 rounded-lg hover:bg-[#8686AC] transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium transform hover:-translate-y-0.5"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div id="results-section" className="md:w-1/2 p-6 md:p-8 bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F0E47] tracking-tight">Salary Breakdown</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-[#8686AC] bg-opacity-10 p-6 rounded-xl shadow-sm border border-[#505081]">
                <h3 className="font-semibold text-lg text-[#0F0E47] mb-4">Salary Summary</h3>
                {results ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Gross Salary', value: results.gross },
                      { label: 'Taxable Income', value: results.taxable },
                      { label: 'Total Deductions', value: results.totalDeductions },
                      { label: 'PAYE Tax', value: results.paye },
                      { label: 'Net Salary', value: results.netPay, bold: true },
                    ].map(({ label, value, bold }) => (
                      <div key={label}>
                        <p className="text-sm text-[#272757]">{label}</p>
                        <p className={`text-base ${bold ? 'font-bold text-[#0F0E47]' : 'font-medium text-[#0F0E47]'}`}>
                          KES {formatNumber(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Gross Salary', 'Taxable Income', 'Total Deductions', 'PAYE Tax', 'Net Salary'].map((label) => (
                      <div key={label}>
                        <p className="text-sm text-[#272757]">{label}</p>
                        <p className="font-medium text-[#505081]">KES -</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-[#8686AC] bg-opacity-10 p-6 rounded-xl shadow-sm border border-[#505081]">
                <h3 className="font-semibold text-lg text-[#0F0E47] mb-4">Detailed Deductions</h3>
                {results ? (
                  <div className="space-y-3">
                    {[
                      { label: 'PAYE Tax', value: results.paye },
                      { label: 'NSSF Contribution', value: results.nssf },
                      { label: 'SHIF Contribution', value: results.shif },
                      { label: 'Affordable Housing Levy', value: results.ahl },
                      ...(results.pension > 0 ? [{ label: 'Pension Contribution', value: results.pension }] : []),
                      ...(results.mortgage > 0 ? [{ label: 'Mortgage Interest', value: results.mortgage }] : []),
                      ...(results.medicalFund > 0 ? [{ label: 'Medical Fund', value: results.medicalFund }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-sm text-[#272757]">{label}</span>
                        <span className="font-medium text-[#0F0E47]">KES {formatNumber(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {['PAYE Tax', 'NSSF Contribution', 'SHIF Contribution', 'Affordable Housing Levy', 'Pension Contribution', 'Mortgage Interest', 'Medical Fund'].map(
                      (label) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-sm text-[#272757]">{label}</span>
                          <span className="font-medium text-[#505081]">KES -</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="bg-[#8686AC] bg-opacity-10 p-6 rounded-xl shadow-sm border border-[#505081]">
                <h3 className="font-semibold text-lg text-[#0F0E47] mb-4">Reliefs</h3>
                {results ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#272757]">Personal Tax Relief</span>
                      <span className="font-medium text-[#0F0E47]">KES {formatNumber(results.personalRelief)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#272757]">Personal Tax Relief</span>
                      <span className="font-medium text-[#505081]">KES -</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#8686AC] bg-opacity-10 p-6 rounded-xl shadow-sm border border-[#505081]">
                <h3 className="font-semibold text-lg text-[#0F0E47] mb-4">PAYE Tax Breakdown</h3>
                {results ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm tax-breakdown-table">
                      <thead>
                        <tr className="border-b border-[#505081] bg-[#8686AC] bg-opacity-30">
                          <th className="py-3 px-4 text-left text-[#0F0E47] font-medium">Tax Band</th>
                          <th className="py-3 px-4 text-right text-[#0F0E47] font-medium">Amount</th>
                          <th className="py-3 px-4 text-right text-[#0F0E47] font-medium">Rate</th>
                          <th className="py-3 px-4 text-right text-[#0F0E47] font-medium">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.taxBreakdown.map((band, index) => (
                          <tr key={index} className="border-b border-[#505081] hover:bg-[#8686AC] hover:bg-opacity-20 transition-colors duration-150">
                            <td className="py-3 px-4 text-left text-[#0F0E47]">{band.range}</td>
                            <td className="py-3 px-4 text-right text-[#0F0E47]">KES {formatNumber(band.amount)}</td>
                            <td className="py-3 px-4 text-right text-[#0F0E47]">{band.rate}</td>
                            <td className="py-3 px-4 text-right font-medium text-[#0F0E47]">KES {formatNumber(band.tax)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm tax-breakdown-table">
                      <thead>
                        <tr className="border-b border-[#505081] bg-[#8686AC] bg-opacity-30">
                          <th className="py-3 px-4 text-left text-[#0F0E47] font-medium">Tax Band</th>
                          <th className="py-3 px-4 text-right text-[#0F0E47] font-medium">Amount</th>
                          <th className="py-3 px-4 text-right text-[#0F0E47] font-medium">Rate</th>
                          <th className="py-3 px-4 text-right text-[#0F0E47] font-medium">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[#505081]">
                          <td colSpan="4" className="py-3 px-4 text-center text-[#505081]">
                            Enter values to calculate
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {results && (
                <div className="flex sm:hidden space-x-3 mt-6 justify-center">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center bg-[#272757] text-white px-4 py-2 rounded-xl shadow-md hover:bg-[#0F0E47] transition-all duration-300 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={generatePDF}
                    className="flex items-center justify-center bg-[#272757] text-white px-4 py-2 rounded-xl shadow-md hover:bg-[#0F0E47] transition-all duration-300 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 11c0-1.1-.9-2-2-2H6a2 2 0 00-2 2v6h4v2h8v-2h4v-6a2 2 0 00-2-2h-4c-1.1 0-2 .9-2 2zM8 9V5a2 2 0 012-2h4a2 2 0 012 2v4"
                      />
                    </svg>
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div id="print-content" className="hidden font-roboto max-w-4xl mx-auto p-6">
          {results ? (
            <>
              <h1 className="text-2xl font-bold text-[#0F0E47] mb-3">Net Pay Calculator Report</h1>
              <p className="text-sm text-[#272757] mb-8">Generated: {currentDate}</p>

              <h2 className="text-lg font-semibold text-[#0F0E47] mt-8 mb-3">Entered Values</h2>
              <div className="mb-8 space-y-2">
                <p className="text-sm text-[#0F0E47]">Basic Salary: KES {formatNumber(basicSalary || 0)}</p>
                <p className="text-sm text-[#0F0E47]">Benefits/Allowances: KES {formatNumber(benefits || 0)}</p>
                <p className="text-sm text-[#0F0E47]">Pension Contribution: KES {formatNumber(pension || 0)}</p>
                <p className="text-sm text-[#0F0E47]">Mortgage Interest: KES {formatNumber(mortgageInterest || 0)}</p>
                <p className="text-sm text-[#0F0E47]">Medical Fund: KES {formatNumber(medicalFund || 0)}</p>
              </div>

              <h2 className="text-lg font-semibold text-[#0F0E47] mt-8 mb-3">Salary Summary</h2>
              <div className="mb-8 space-y-2">
                <p className="text-sm text-[#0F0E47]">Gross Salary: KES {formatNumber(results.gross)}</p>
                <p className="text-sm text-[#0F0E47]">Taxable Income: KES {formatNumber(results.taxable)}</p>
                <p className="text-sm text-[#0F0E47]">Total Deductions: KES {formatNumber(results.totalDeductions)}</p>
                <p className="text-sm text-[#0F0E47]">PAYE Tax: KES {formatNumber(results.paye)}</p>
                <p className="text-sm font-bold text-[#0F0E47]">Net Pay: KES {formatNumber(results.netPay)}</p>
              </div>

              <h2 className="text-lg font-semibold text-[#0F0E47] mt-8 mb-3">Detailed Deductions</h2>
              <table className="w-full text-sm mb-8 border-collapse">
                <thead>
                  <tr className="bg-[#8686AC] bg-opacity-30 text-[#0F0E47] font-medium">
                    <th className="p-3 text-left border-b border-[#505081]">Description</th>
                    <th className="p-3 text-right border-b border-[#505081]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'PAYE Tax', value: results.paye },
                    { label: 'NSSF Contribution', value: results.nssf },
                    { label: 'SHIF Contribution', value: results.shif },
                    { label: 'Affordable Housing Levy', value: results.ahl },
                    ...(results.pension > 0 ? [{ label: 'Pension Contribution', value: results.pension }] : []),
                    ...(results.mortgage > 0 ? [{ label: 'Mortgage Interest', value: results.mortgage }] : []),
                    ...(results.medicalFund > 0 ? [{ label: 'Medical Fund', value: results.medicalFund }] : []),
                  ].map(({ label, value }) => (
                    <tr key={label} className="border-b border-[#505081] hover:bg-[#8686AC] hover:bg-opacity-20">
                      <td className="p-3">{label}</td>
                      <td className="p-3 text-right">KES {formatNumber(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2 className="text-lg font-semibold text-[#0F0E47] mt-8 mb-3">Reliefs</h2>
              <table className="w-full text-sm mb-8 border-collapse">
                <thead>
                  <tr className="bg-[#8686AC] bg-opacity-30 text-[#0F0E47] font-medium">
                    <th className="p-3 text-left border-b border-[#505081]">Description</th>
                    <th className="p-3 text-right border-b border-[#505081]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#505081] hover:bg-[#8686AC] hover:bg-opacity-20">
                    <td className="p-3">Personal Tax Relief</td>
                    <td className="p-3 text-right">KES {formatNumber(results.personalRelief)}</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-lg font-semibold text-[#0F0E47] mt-8 mb-3">PAYE Tax Breakdown</h2>
              <table className="w-full text-sm mb-8 border-collapse">
                <thead>
                  <tr className="bg-[#8686AC] bg-opacity-30 text-[#0F0E47] font-medium">
                    <th className="p-3 text-left border-b border-[#505081]">Tax Band</th>
                    <th className="p-3 text-right border-b border-[#505081]">Amount</th>
                    <th className="p-3 text-right border-b border-[#505081]">Rate</th>
                    <th className="p-3 text-right border-b border-[#505081]">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {results.taxBreakdown.map((band, index) => (
                    <tr key={index} className="border-b border-[#505081] hover:bg-[#8686AC] hover:bg-opacity-20">
                      <td className="p-3 text-left text-[#0F0E47]">{band.range}</td>
                      <td className="p-3 text-right text-[#0F0E47]">KES {formatNumber(band.amount)}</td>
                      <td className="p-3 text-right text-[#0F0E47]">{band.rate}</td>
                      <td className="p-3 text-right text-[#0F0E47]">KES {formatNumber(band.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-xs text-[#272757] text-center mt-8">
                © 2025 Net Salary Calculator. Rates based on current KRA tax bands.
              </p>
            </>
          ) : (
            <p className="text-sm text-[#272757] text-center">No results available. Please calculate your salary first.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default PayeCalculator;