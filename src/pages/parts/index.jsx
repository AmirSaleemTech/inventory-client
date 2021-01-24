import Header from "../../component/layout/Header";
import PartList from "../../component/part/PartList";
import ProtectedContent from "../../component/ProtectedContent";
import URL from "../../utils/URL";
import Body from '../../component/layout/Body';
import Footer from '../../component/layout/Footer';
import { useContext, useEffect, useState } from 'react';
import { DispatchContext, StateContext } from './../../utils/context/AppContext';
import ListAction from './../../utils/actions/ListAction';
import Define from "../../utils/Define";
import Types from "../../utils/actions/Types";
import Alert from "../../component/layout/Alert";
import Loading from "../../component/layout/Loading";
import ModalAddPart from "../../component/layout/modal/ModalAddPart";

import Exceljs from 'exceljs'
import { saveAs } from "file-saver";



export default function index({ data }) {

    const { partlist } = useContext(StateContext)
    const { partlistDispatch } = useContext(DispatchContext)

    const initState = {
        id: null,
        part_title: "",
        brand: "",
        manufacturer_part_num: "",
        part_desc: "",
        part_stock: 0,
        store_location: "",
        supplier_name: "",
        parts_img: "",
        purchased_date: new Date(),
    };
    const [input, setInput] = useState(initState);
    const [key, setKey] = useState("");

    //life cycle
    useEffect(() => {
        partlistDispatch({
            type: Types.GET_ALL_DATA,
            payload: data//an array
        });
        return () => {
            //cleanup
        }
    }, [])


    //seach part:
    const searchNow = (e) => {
        const key = e.target.value.toString()
        if (key.length > 2) {
            const found = partlist.filter(itm => {
                const title = itm.part_title
                if (title.includes(e.target.value)) {
                    return true;
                } else {
                    return false;
                }
            });
            partlistDispatch({
                type: Types.GET_ALL_DATA,
                payload: found//an array
            });
        } else {
            partlistDispatch({
                type: Types.GET_ALL_DATA,
                payload: data//an array
            });
        }

    }


    //generate excel/pdf
    const generatePdf = async () => {
        try {

            //ceate the work book
            const wb = new Exceljs.Workbook()
            const wb_sheet = wb.addWorksheet('part_list')
            wb_sheet.columns = [
                { header: "id", key: "id" },
                { header: "part_title", key: "part_title" },
                { header: "supplier_name", key: "supplier_name" },
                { header: "manufacturer_part_num", key: "manufacturer_part_num" },
                { header: "brand", key: "brand" },
                { header: "store_location", key: "store_location" },
                { header: "parts_img", key: "parts_img" },
                { header: "part_stock", key: "part_stock" },
                { header: "part_desc", key: "part_desc" },
                { header: "purchased_date", key: "purchased_date" },
            ]

            partlist.forEach(part => {
                wb_sheet.addRow(part)
            })
            wb_sheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true }
            })

            // await wb.xlsx.writeFile('myexel.xlsx')
            const buffer = await wb.xlsx.writeBuffer();
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const fileExtension = '.xlsx';

            const blob = new Blob([buffer], { type: fileType });

            saveAs(blob, 'milon27excel' + fileExtension);

        } catch (e) {
            console.log("xlsx error", e);
        }

    }


    return (
        <>
            <Header title="Parts List" />
            <ProtectedContent url={URL.PART_LIST} />
            <Body>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <Alert />
                            <Loading color="info" />
                        </div>
                    </div>
                    <div className="row py-4">
                        <ModalAddPart id="addPart" value={{ input, setInput, initState }} />
                        <div className="col-md-6">
                            <h3>All Part List</h3>
                            <input className="form-control" placeholder="Search by parts title" onChange={searchNow} />
                        </div>
                        <div className="col-md-6 text-right">
                            {/* open modal form when click on it */}
                            <button onClick={generatePdf} type="button" className="btn btn-info badge-pill px-4" >
                                Generate PDF</button>
                            <button type="button" className="btn btn-primary badge-pill px-4 mx-2" data-toggle="modal" data-target="#addPart">
                                Add New Part</button>

                        </div>
                    </div>
                </div>
                <PartList data={{ partlist, setInput }} />
            </Body>
            <Footer />
        </>
    )
}

export const getServerSideProps = async (context) => {
    ListAction.getSource()
    const res = await ListAction.getAll(Define.part_collection)
    //console.log(res);
    return {
        props: {
            data: res.data,//arry
        }
    }
}

// export const getStaticProps = async (context) => {
//     return {
//         props: {
//             data: []//arry
//         }
//     }
// }


