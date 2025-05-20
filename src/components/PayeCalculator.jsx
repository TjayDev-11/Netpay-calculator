import React, { useState } from 'react';

const PayeCalculator = () => {
  const [basicSalary, setBasicSalary] = useState('');
  const [benefits, setBenefits] = useState('');
  const [pension, setPension] = useState('');
  const [mortgageInterest, setMortgageInterest] = useState('');
  const [medicalFund, setMedicalFund] = useState('');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({
    basicSalary: '',
    benefits: '',
    pension: '',
    mortgageInterest: '',
    medicalFund: '',
  });
  const [globalError, setGlobalError] = useState('');

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
    const tier1Contribution = 480; // 8000 * 0.06
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
      <style>
        {`
          @media print {
            header, .input-section, button {
              display: none !important;
            }
            #results-section {
              display: block !important;
              width: 100%;
              padding: 20px;
              box-sizing: border-box;
            }
            body {
              background: white !important;
            }
          }
        `}
      </style>
      <header className="relative text-white py-6 shadow-lg overflow-hidden">
  {/* Gradient background with subtle diagonal transition */}
  <div 
    className="absolute inset-0 z-0 rounded-br-[30px]"
    style={{
      background: 'linear-gradient(135deg, #2F4F4F 0%, #1E3E3E 70%, #0D2C2C 100%)'
    }}
  ></div>
  
  {/* Soft white corner accent */}
  <div className="absolute right-0 bottom-0 z-0 w-32 h-32">
    <div className="absolute right-0 bottom-0 w-full h-full bg-white bg-opacity-10 rounded-tl-[50px] rounded-br-[30px] backdrop-blur-[1px]"></div>
    <div className="absolute right-0 bottom-0 w-16 h-16 bg-white bg-opacity-5 rounded-tl-[30px]"></div>
  </div>
  
  {/* Content */}
  <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl text-cyan-300 font-bold">Net Pay Calculator</h1>
        <p className="text-cyan-200 mt-1 opacity-90">Calculate Net Pay, PAYE, NSSF & Deductions</p>
      </div>
      <button
        onClick={handlePrint}
        disabled={!results}
        className="hidden md:flex items-center bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-100 transition-all duration-300 hover:shadow-lg border border-gray-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>
    </div>
  </div>
</header>

      <main className="flex-grow py-8">
        <div id="calculator-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-6 md:p-8 bg-gradient-to-br from-blue-50 to-gray-50 input-section">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Salary Details</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (KES)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">KES</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={basicSalary}
                        onChange={(e) => handleInputChange(e.target.value, setBasicSalary, 'basicSalary')}
                        className="pl-10 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    {errors.basicSalary && <p className="text-red-500 text-xs mt-1">{errors.basicSalary}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benefits/Allowances (KES)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">KES</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={benefits}
                        onChange={(e) => handleInputChange(e.target.value, setBenefits, 'benefits')}
                        className="pl-10 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {errors.benefits && <p className="text-red-500 text-xs mt-1">{errors.benefits}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pension Contribution (KES)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">KES</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pension}
                        onChange={(e) => handleInputChange(e.target.value, setPension, 'pension')}
                        className="pl-10 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {errors.pension && <p className="text-red-500 text-xs mt-1">{errors.pension}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Interest (KES)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">KES</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={mortgageInterest}
                        onChange={(e) => handleInputChange(e.target.value, setMortgageInterest, 'mortgageInterest')}
                        className="pl-10 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {errors.mortgageInterest && <p className="text-red-500 text-xs mt-1">{errors.mortgageInterest}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Fund (KES)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">KES</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={medicalFund}
                        onChange={(e) => handleInputChange(e.target.value, setMedicalFund, 'medicalFund')}
                        className="pl-10 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {errors.medicalFund && <p className="text-red-500 text-xs mt-1">{errors.medicalFund}</p>}
                  </div>

                  {globalError && <p className="text-red-500 text-xs mt-1">{globalError}</p>}
                  <div className="flex space-x-4">
                    <button
                      onClick={calculateTax}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                    >
                      Calculate Net Pay
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white p-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div id="results-section" className="md:w-1/2 p-6 md:p-8 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Salary Breakdown</h2>
                  <button
                    onClick={handlePrint}
                    disabled={!results}
                    className="md:hidden flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Salary Summary</h3>
                    {results ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Gross Salary</p>
                          <p className="font-bold">KES {results.gross.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Taxable Income</p>
                          <p className="font-bold">KES {results.taxable.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Deductions</p>
                          <p className="font-bold">KES {results.totalDeductions.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PAYE Tax</p>
                          <p className="font-bold">KES {results.paye.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Net Salary</p>
                          <p className="font-bold text-green-600">KES {results.netPay.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Gross Salary</p>
                          <p className="font-bold text-gray-400">KES -</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Taxable Income</p>
                          <p className="font-bold text-gray-400">KES -</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Deductions</p>
                          <p className="font-bold text-gray-400">KES -</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PAYE Tax</p>
                          <p className="font-bold text-gray-400">KES -</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Net Salary</p>
                          <p className="font-bold text-gray-400">KES -</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Detailed Deductions</h3>
                    {results ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">PAYE Tax</span>
                          <span className="font-medium">KES {results.paye.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">NSSF Contribution</span>
                          <span className="font-medium">KES {results.nssf.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">SHIF Contribution</span>
                          <span className="font-medium">KES {results.shif.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Affordable Housing Levy</span>
                          <span className="font-medium">KES {results.ahl.toFixed(2)}</span>
                        </div>
                        {results.pension > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm">Pension Contribution</span>
                            <span className="font-medium">KES {results.pension.toFixed(2)}</span>
                          </div>
                        )}
                        {results.mortgage > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm">Mortgage Interest</span>
                            <span className="font-medium">KES {results.mortgage.toFixed(2)}</span>
                          </div>
                        )}
                        {results.medicalFund > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm">Medical Fund</span>
                            <span className="font-medium">KES {results.medicalFund.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">PAYE Tax</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">NSSF Contribution</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">SHIF Contribution</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Affordable Housing Levy</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pension Contribution</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Mortgage Interest</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Medical Fund</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Reliefs</h3>
                    {results ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Personal Tax Relief</span>
                          <span className="font-medium">KES {results.personalRelief.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Personal Tax Relief</span>
                          <span className="font-medium text-gray-400">KES -</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">PAYE Tax Breakdown</h3>
                    {results ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="pb-2 text-left text-gray-600">Tax Band</th>
                              <th className="pb-2 text-right text-gray-600">Amount</th>
                              <th className="pb-2 text-right text-gray-600">Rate</th>
                              <th className="pb-2 text-right text-gray-600">Tax</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.taxBreakdown.map((band, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-2 text-left">{band.range}</td>
                                <td className="py-2 text-right">KES {band.amount.toLocaleString()}</td>
                                <td className="py-2 text-right">{band.rate}</td>
                                <td className="py-2 text-right font-medium">KES {band.tax.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="pb-2 text-left text-gray-600">Tax Band</th>
                              <th className="pb-2 text-right text-gray-600">Amount</th>
                              <th className="pb-2 text-right text-gray-600">Rate</th>
                              <th className="pb-2 text-right text-gray-600">Tax</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td colSpan="4" className="py-2 text-center text-gray-400">
                                Enter values to calculate
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-300">© 2025 Net Salary Calculator. This tool is for informational purposes only.</p>
          <p className="text-xs text-gray-500 mt-1">Rates based on current KRA tax bands and deductions.</p>
        </div>
      </footer>
    </div>
  );
};

export default PayeCalculator;