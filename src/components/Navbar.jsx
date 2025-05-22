import React from 'react';

const Navbar = ({ handlePrint, generatePDF, results }) => (
  <header className="bg-gradient-to-r from-[#cfd9da] to-[#69bdbc] py-6 px-4 sm:px-6 lg:px-8 rounded-br-[2rem] rounded-bl-[2rem] shadow-lg">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Net Pay Calculator</h1>
        <p className="text-base text-[#08080a] mt-1">Calculate Net Pay, PAYE, NSSF & Deductions</p>
      </div>
      <div className="hidden sm:flex space-x-3">
        <button
          onClick={handlePrint}
          disabled={!results}
          className="flex items-center justify-center bg-white text-[#272757] px-4 py-2 rounded-xl shadow-md hover:bg-[#8686AC] hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          disabled={!results}
          className="flex items-center justify-center bg-white text-[#272757] px-4 py-2 rounded-xl shadow-md hover:bg-[#8686AC] hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  </header>
);

export default Navbar;