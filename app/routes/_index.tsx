import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Form, json, useActionData, useFetcher } from "@remix-run/react";
import db from '../lib/db.server';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-quartz.css"; 
import { useState } from "react";

type Data = {
  INST_CODE: string,
  INSTITUTE_NAME: string,
  PLACE: string,
  BRANCH_NAME: string,
  AFFILIATED: string,
  TUITION_FEE: number,
  LAST_RANK: number
}

const gridOptions: any = {
  columnDefs: [
    { field: "INST_CODE", headerName: 'Institute Code', flex: 0.5 },
    { field: "INSTITUTE_NAME", headerName: 'Institute Name', flex: 2 },
    { field: "PLACE", headerName: 'Place' },
    { field: "BRANCH_NAME", headerName: 'Branch Name', flex: 2 },
    { field: "AFFILIATED", headerName: 'Affiliated', flex: 0.5 },
    { field: "TUITION_FEE", headerName: 'Tuition Fee', flex: 0.5 },
    { field: "last_rank", headerName: 'Last Rank', flex: 0.5 },
  ],
  pagination: true,
  paginationPageSize: 50,
  defaultColDef: { flex: 1 },
}

export const meta: MetaFunction = () => {
  return [
    { title: "TS EAMCET College Predictor" }
  ];
};
async function queryTable(values: any): Promise<void> {
  let branch = values.branch.toString();
  let rank = Number(values.rank.toString());
  let category = values.category.toString();
  let table; 
  switch (values.lastRank.toString()) {
    case "final_phase_2023":
      table = `public."TS_EAMCET_2023_FINAL_PHASE"`; break;
    case "final_phase_2022":
      table = `public."TS_EAMCET_2022_FINAL_PHASE"`; break;
    case "first_phase_2022":
      table = `public."TS_EAMCET_2022_FIRST_PHASE"`; break;
  }
  let sql = `select distinct "INST_CODE","INSTITUTE_NAME","PLACE","BRANCH_NAME","TUITION_FEE","AFFILIATED","${category}" AS LAST_RANK from ${table} where "BRANCH" = '${branch}' and "${category}">=${rank}`;
  if (values.category.toString().includes("BOYS")) {
    sql += ` and "${category}"!=0 `;
  }
  if (values.type.toString().length > 0) {
    sql += ` and "TYPE"='${values.type.toString()}' `;
  }
  if (values.coed.toString().length > 0) {
    sql += ` and "COED"='${values.coed.toString()}' `;
  }
  if (values.affiliated.toString().length > 0) {
    sql += ` and "AFFILIATED"='${values.affiliated.toString()}' `;
  }
  sql += ` order by "${category}" asc`
  const data: any = await db.query(sql);
  return data;
}

export const action: ActionFunction = async ({ request }) => {
  var positiveNumberRegex = /^\d+$/;
  const categorys: string[] = ["OC_BOYS", "OC_GIRLS", "BC_A_GIRLS", "BC_A_BOYS", "BC_B_BOYS", "BC_B_GIRLS", "BC_C_BOYS", "BC_C_GIRLS", "BC_D_GIRLS", "BC_D_BOYS", "BC_E_BOYS", "BC_E_GIRLS", "SC_BOYS", "SC_GIRLS", "ST_BOYS", "ST_GIRLS", "EWS_GEN_OU", "EWS_GIRLS_OU"];
  const branchs: string[] = ["ANE", "AGR", "AI", "AID", "AIM", "AUT", "PHM", "BME", "BIO", "MMS", "MTE", "CHE", "CIV", "CME", "CSW", "CSG", "CSN", "CSB", "CSE", "CSM", "CSC", "CSD",
    "CSO", "CSI", "CST", "CIC", "DRG", "DTD", "EEE", "ECE", "ECM", "EIE", "ETM", "ECI", "FDT", "INF", "MCT", "MEC", "MET", "MMT", "MIN", "PHD", "PHE", "PLG", "TEX"
  ]
  const phases: string[] = ["first_phase_2022", "final_phase_2022", "final_phase_2023"];
  const types: string[] = ["UNIV", "PVT", "SF", "GOV"];
  const coed: string[] = ["GIRLS", "COED"];
  const affiliations: string[] = ["PJTSAU", "ANURAG UNIVERSITY", "KU", "PLMU", "SVHU", "SR UNIVERSITY", "JNTUH", "MGUN", "PVNRTVU", "CONSTITUENT COLLEGE", "OU"];
  const values = Object.fromEntries(await request.formData())
  //console.log(values);
  //validation rules for input
  if (values.rank.toString().length == 0 || !positiveNumberRegex.test(values.rank.toString())) {
    return new Response("Invalid Rank Input", {
      status: 400,
    });
  }
  if (values.category.toString().length == 0 || !categorys.includes(values.category.toString())) {
    return new Response("Invalid Category Input", {
      status: 400,
    });
  }
  if (values.branch.toString().length == 0 || !branchs.includes(values.branch.toString())) {
    return new Response("Invalid Branch Input", {
      status: 400,
    });
  }
  if (values.lastRank.toString().length == 0 || !phases.includes(values.lastRank.toString())) {
    return new Response("Invalid Phase Input", {
      status: 400,
    });
  }
  if (values.type.toString().length > 0 && !types.includes(values.type.toString())) {
    return new Response("Invalid Type Input", {
      status: 400,
    });
  }
  if (values.coed.toString().length > 0 && !coed.includes(values.coed.toString())) {
    return new Response("Invalid Coed Input", {
      status: 400,
    });
  }
  if (values.affiliated.toString().length > 0 && !affiliations.includes(values.affiliated.toString())) {
    return new Response("Invalid Affiliation Input", {
      status: 400,
    });
  }

  let data = await queryTable(values);
  return json(data.rows);

}


export default function Index() {
  const data = useActionData<typeof action>();
  const fetcher = useFetcher();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    setIsSubmitted(true)
    setIsLoading(true);
    fetcher.submit(e.target, { method: "post" });
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  return (
    <>
      <header className="bg-white border-b-2 border-solid border-grey-500">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <a className="block text-teal-600" href="#">
            <span className="sr-only">Home</span>
            <svg className="h-8" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78C23.7557 10.3549 21.7729 10.9599 20.11 12.1147C20.014 12.1842 19.9138 12.2477 19.81 12.3047H19.67C19.5662 12.2477 19.466 12.1842 19.37 12.1147C17.6924 10.9866 15.7166 10.3841 13.695 10.3841C11.6734 10.3841 9.6976 10.9866 8.02 12.1147C7.924 12.1842 7.8238 12.2477 7.72 12.3047H7.58C7.4762 12.2477 7.376 12.1842 7.28 12.1147C5.6171 10.9599 3.6343 10.3549 1.61 10.3847H0.41ZM23.62 16.6547C24.236 16.175 24.9995 15.924 25.78 15.9447H27.39V12.7347H25.78C24.4052 12.7181 23.0619 13.146 21.95 13.9547C21.3243 14.416 20.5674 14.6649 19.79 14.6649C19.0126 14.6649 18.2557 14.416 17.63 13.9547C16.4899 13.1611 15.1341 12.7356 13.745 12.7356C12.3559 12.7356 11.0001 13.1611 9.86 13.9547C9.2343 14.416 8.4774 14.6649 7.7 14.6649C6.9226 14.6649 6.1657 14.416 5.54 13.9547C4.4144 13.1356 3.0518 12.7072 1.66 12.7347H0V15.9447H1.61C2.39051 15.924 3.154 16.175 3.77 16.6547C4.908 17.4489 6.2623 17.8747 7.65 17.8747C9.0377 17.8747 10.392 17.4489 11.53 16.6547C12.1468 16.1765 12.9097 15.9257 13.69 15.9447C14.4708 15.9223 15.2348 16.1735 15.85 16.6547C16.9901 17.4484 18.3459 17.8738 19.735 17.8738C21.1241 17.8738 22.4799 17.4484 23.62 16.6547ZM23.62 22.3947C24.236 21.915 24.9995 21.664 25.78 21.6847H27.39V18.4747H25.78C24.4052 18.4581 23.0619 18.886 21.95 19.6947C21.3243 20.156 20.5674 20.4049 19.79 20.4049C19.0126 20.4049 18.2557 20.156 17.63 19.6947C16.4899 18.9011 15.1341 18.4757 13.745 18.4757C12.3559 18.4757 11.0001 18.9011 9.86 19.6947C9.2343 20.156 8.4774 20.4049 7.7 20.4049C6.9226 20.4049 6.1657 20.156 5.54 19.6947C4.4144 18.8757 3.0518 18.4472 1.66 18.4747H0V21.6847H1.61C2.39051 21.664 3.154 21.915 3.77 22.3947C4.908 23.1889 6.2623 23.6147 7.65 23.6147C9.0377 23.6147 10.392 23.1889 11.53 22.3947C12.1468 21.9165 12.9097 21.6657 13.69 21.6847C14.4708 21.6623 15.2348 21.9135 15.85 22.3947C16.9901 23.1884 18.3459 23.6138 19.735 23.6138C21.1241 23.6138 22.4799 23.1884 23.62 22.3947Z"
                fill="currentColor"
              />
            </svg>
          </a>

          <div className="flex flex-1 items-center justify-end md:justify-between">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-lg">
                <li>
                  <a className="text-black-500 transition  font-semibold" href="#"> TS EAMCET College Predictor  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header> <br />
      <div className="p-10">
        <Form method="post" onSubmit={handleSubmit}>
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row"> {/* Use flex-col for mobile and flex-row for larger screens */}
              {/* Standalone element */}
              <div className="w-full sm:w-1/4 flex flex-col justify-between pr-0 sm:pr-8 mb-4 sm:mb-0"> {/* Use full width on mobile and 1/4 on larger screens */}
                <div className="my-auto">
                  <div className="sm:col-span-2">
                    <label htmlFor="rank" className="block text-sm font-medium leading-6 ">
                      Rank*
                    </label>
                    <div className="mt-2">
                      <input
                        required
                        type="text"
                        name="rank"
                        id="rank"
                        style={{ fontSize: '18px' }}
                        pattern="[0-9]+" title="Please enter a positive number"
                        className="block w-full rounded-md border-0 py-1.5  shadow-sm ring-1 ring-inset  focus:ring-2 focus:ring-inset focus:ring-white-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid and right side */}
              <div className="w-full sm:w-3/4 flex justify-start">
                {/* Grid with reduced vertical gap */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 gap-y-2 w-full">
                  {/* First row */}
                  <div>
                    <label htmlFor="lastRank" className="block text-sm font-medium leading-6 ">Phase*</label>
                    <select name="lastRank" id="lastRank" className="p-4 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                      <option value="">Choose Phase</option>
                      <option value="final_phase_2023">Final Phase (2023)</option>
                      <option value="first_phase_2022">First Phase (2022)</option>
                      <option value="final_phase_2022">Final Phase (2022)</option>
                    </select>
                  </div>


                  <div>
                    <label htmlFor="type" className="block text-sm font-medium leading-6 ">Type</label>
                    <select name="type" id="type" className="p-4 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <option value="">Choose College Type</option>
                      <option value="UNIV">University</option>
                      <option value="PVT">Private</option>
                      <option value="SF">Self-financed</option>
                      <option value="GOV">Government</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="coed" className="block text-sm font-medium leading-6 ">
                      Co-Education
                    </label>
                    <select name="coed" id="coed" className="p-4 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <option value="">Choose Co-Ed</option>
                      <option value="GIRLS">Girls</option>
                      <option value="COED">Co-Education</option>
                    </select>
                  </div>

                  {/* Second row */}
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium leading-6 ">Branch*</label>
                    <select name="branch" id="branch" className="p-4 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                      <option value="">Choose Branch</option>
                      <option value="ANE">AERONAUTICAL ENGINEERING</option>
                      <option value="AGR">AGRICULTURAL ENGINEERING</option>
                      <option value="AI">ARTIFICIAL INTELLIGENCE</option>
                      <option value="AID">ARTIFICIAL INTELLIGENCE AND DATA SCIENCE</option>
                      <option value="AIM">ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING</option>
                      <option value="AUT">AUTOMOBILE ENGINEERING</option>
                      <option value="PHM">B. PHARMACY (M.P.C. STREAM)</option>
                      <option value="BME">BIO-MEDICAL ENGINEERING</option>
                      <option value="BIO">BIO-TECHNOLOGY</option>
                      <option value="MMS">BTECH MECHANICAL WITH MTECH MANUFACTURING SYSTEMS</option>
                      <option value="MTE">BTECH MECHANICAL WITH MTECH THERMAL ENGG</option>
                      <option value="CHE">CHEMICAL ENGINEERING</option>
                      <option value="CIV">CIVIL ENGINEERING</option>
                      <option value="CME">COMPUTER ENGINEERING</option>
                      <option value="CSW">COMPUTER ENGINEERING(SOFTWARE ENGINEERING)</option>
                      <option value="CSG">COMPUTER SCIENCE & DESIGN</option>
                      <option value="CSN">COMPUTER SCIENCE & ENGINEERING (NETWORKS)</option>
                      <option value="CSB">COMPUTER SCIENCE AND BUSINESS SYSTEM</option>
                      <option value="CSE">COMPUTER SCIENCE AND ENGINEERING</option>
                      <option value="CSM">COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)</option>
                      <option value="CSC">COMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)</option>
                      <option value="CSD">COMPUTER SCIENCE AND ENGINEERING (DATA SCIENCE)</option>
                      <option value="CSO">COMPUTER SCIENCE AND ENGINEERING (IOT)</option>
                      <option value="CSI">COMPUTER SCIENCE AND INFORMATION TECHNOLOGY</option>
                      <option value="CST">COMPUTER SCIENCE AND TECHNOLOGY</option>
                      <option value="CIC">CSE (IoT AND CYBER SECURITY INCLUDING BLOCK CHAIN TECHNOLOGY)</option>
                      <option value="DRG">DAIRYING</option>
                      <option value="DTD">DIGITAL TECHNIQUES FOR DESIGN AND PLANNING</option>
                      <option value="EEE">ELECTRICAL AND ELECTRONICS ENGINEERING</option>
                      <option value="ECE">ELECTRONICS AND COMMUNICATION ENGINEERING</option>
                      <option value="ECM">ELECTRONICS AND COMPUTER ENGINEERING</option>
                      <option value="EIE">ELECTRONICS AND INSTRUMENTATION ENGINEERING</option>
                      <option value="ETM">ELECTRONICS AND TELEMATICS</option>
                      <option value="ECI">ELECTRONICS COMMUNICATION AND INSTRUMENTATION ENGINEERING</option>
                      <option value="FDT">FOOD TECHNOLOGY</option>
                      <option value="INF">INFORMATION TECHNOLOGY</option>
                      <option value="MCT">MECHANICAL (MECHTRONICS) ENGINEERING</option>
                      <option value="MEC">MECHANICAL ENGINEERING</option>
                      <option value="MET">METALLURGICAL ENGINEERING</option>
                      <option value="MMT">METALLURGY AND MATERIAL ENGINEERING</option>
                      <option value="MIN">MINING ENGINEERING</option>
                      <option value="PHD">PHARM - D (M.P.C. STREAM)</option>
                      <option value="PHE">PHARMACEUTICAL ENGINEERING</option>
                      <option value="PLG">PLANNING</option>
                      <option value="TEX">TEXTILE TECHNOLOGY</option>
                    </select></div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium leading-6 ">Category*</label>
                    <select name="category" className="p-4 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                      <option value="">Choose Category</option>
                      <option value="OC_BOYS">OC Male</option>
                      <option value="OC_GIRLS">OC Female</option>
                      <option value="BC_A_GIRLS">BC A Female</option>
                      <option value="BC_A_BOYS">BC A Male</option>
                      <option value="BC_B_BOYS">BC B Male</option>
                      <option value="BC_B_GIRLS">BC B Female</option>
                      <option value="BC_C_BOYS">BC C Male</option>
                      <option value="BC_C_GIRLS">BC C Female</option>
                      <option value="BC_D_GIRLS">BC D Female</option>
                      <option value="BC_D_BOYS">BC D Male</option>
                      <option value="BC_E_BOYS">BC E Male</option>
                      <option value="BC_E_GIRLS">BC E Female</option>
                      <option value="SC_BOYS">SC Male</option>
                      <option value="SC_GIRLS">SC Female</option>
                      <option value="ST_BOYS">ST Male</option>
                      <option value="ST_GIRLS">ST Female</option>
                      <option value="EWS_GEN_OU">EWS Male</option>
                      <option value="EWS_GIRLS_OU">EWS Female</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="affiliated" className="block text-sm font-medium leading-6 ">Affiliated</label>
                    <select id="affiliated" name="affiliated" className="p-4 w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <option value="">Choose Affiliation</option>
                      <option value="PJTSAU">PJTSAU</option>
                      <option value="ANURAG UNIVERSITY">ANURAG UNIVERSITY</option>
                      <option value="KU">KU</option>
                      <option value="PLMU">PLMU</option>
                      <option value="SVHU">SVHU</option>
                      <option value="SR UNIVERSITY">SR UNIVERSITY</option>
                      <option value="JNTUH">JNTUH</option>
                      <option value="MGUN">MGUN</option>
                      <option value="PVNRTVU">PVNRTVU</option>
                      <option value="CONSTITUENT COLLEGE">CONSTITUENT COLLEGE</option>
                      <option value="OU">OU</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-40 grid grid-cols-3 content-evenly ...">
              <div></div>
              <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
              <div></div>
            </div>
          </div>
        </Form>

        {isLoading && <div className="text-center">
          <div role="status">
            <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>}

        {(!isLoading && isSubmitted) ? <div className="p-10">
          <div
            className="ag-theme-quartz" // applying the grid theme
            style={{ height: 600 }} // the grid will fill the size of the parent container
          >
            <AgGridReact
              rowData={data}
              gridOptions={gridOptions}
            />
          </div>
        </div> : null }

      </div>

      <footer className="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-white-800 dark:border-gray-300">
        <span className="text-sm text-white-500 sm:text-center dark:text-white-400">© 2024 <a href="#" className="hover:underline">TS EAMCET College Predictor™</a>
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white-500 dark:text-gray-400 sm:mt-0">
          <li>
            <a href="https://www.linkedin.com/in/sai-teja-vangapalli-901899242" target="_blank" className="hover:underline me-4 md:me-6">Linkedin</a>
          </li>

        </ul>
      </footer>

    </>



  );
}
