import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { DataGrid } from '@mui/x-data-grid';

import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import api from '../../../api/api'
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import { selectCurrentAccount} from '../../../redux-toolkit/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { brokers } from '../../brokersNames/brokers.js'
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,

} from '@mui/material';
import { selectlanguage } from '../../../redux-toolkit/languagesSlice';


const ProfitFactor = (trade) => {
    if (trade.totalLoss === 0 || trade.totalWin === 0) return 0;
    return (trade.totalWin / trade.totalLoss < 0 ? trade.totalWin / trade.totalLoss * -1 : trade.totalWin / trade.totalLoss).toFixed(2);
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function getFormattedDate(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const [weekday, month, day, year] = formattedDate.split(' ');
    const abbreviatedWeekday = weekday.slice(0, 3); // Take the first three characters of the weekday
    const abbreviatedMonth = month.slice(0, 3); // Take the first three characters of the month

    return `${abbreviatedWeekday}, ${abbreviatedMonth} ${day} ${year}`;
}

let style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 990,
    height: 480,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


export default function AddFarshel(props) {

    //------------------------------------------------  States ----------------------------------------------------- //
    const isHebrew = useSelector(selectlanguage);
    const trade = props.trade;
    let rows;
    const totalPnL = props.trade.totalPnL;
    const winRate = ((props.trade.win / (props.trade.win + props.trade.loss)) * 100).toFixed(2);
    const handleOpen = () => props.handleOpenModal(true);
    const handleClose = () => props.handleOpenModal(false);
    const [selectedComment, setSelectedComment] = useState('');
    const [openCommend, setCommendOpen] = React.useState(false);
    const [trades, setTrades] = useState([]);
    const currentAccount = useSelector(selectCurrentAccount);
    let columns;
    if (isHebrew === false) {

        columns = [
            { field: 'time', headerName: 'Time', width: 100, editable: false, },
            { field: 'symbol', headerName: 'Symbol', width: 100, editable: false, },
            { field: 'netROI', headerName: 'Net ROI', width: 100, editable: false, },
            { field: 'contracts', headerName: 'Contracts', width: 100, editable: false, },
            { field: 'entryPrice', headerName: 'Entry Price', width: 100, editable: false, },
            { field: 'exitPrice', headerName: 'Exit Price', width: 100, editable: false, },
            { field: 'duration', headerName: 'Duration', width: 120, editable: false, },
            { field: 'commission', headerName: 'Commission', width: 100, editable: false, },
            { field: 'netPnL', headerName: 'Net P&L', width: 100, editable: false, },
        ];
    }
    else {
        columns = [
            { field: 'time', headerName: 'זמן', width: 100, editable: false },
            { field: 'symbol', headerName: 'סמל', width: 100, editable: false },
            { field: 'netROI', headerName: 'רוי נטו', width: 100, editable: false },
            { field: 'contracts', headerName: 'חוזים', width: 100, editable: false },
            { field: 'entryPrice', headerName: 'מחיר כניסה', width: 100, editable: false },
            { field: 'exitPrice', headerName: 'מחיר יציאה', width: 100, editable: false },
            { field: 'duration', headerName: 'זמן עסקה', width: 120, editable: false },
            { field: 'commission', headerName: 'עמלה', width: 100, editable: false },
            { field: 'netPnL', headerName: 'רווח / הפסד נטו', width: 100, editable: false },
        ];
    }

    if (currentAccount !== null) {

        style = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 990,
            height: 480,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
        };

        if (isHebrew === false) {
            columns = [
                { field: 'time', headerName: 'Time', width: 130, editable: false, },
                { field: 'symbol', headerName: 'Symbol', width: 100, editable: false, },
                { field: 'netROI', headerName: 'Net ROI', width: 100, editable: false, },
                { field: currentAccount?.Broker == brokers.Tradovate ? 'contracts' : "quantity", headerName: currentAccount?.Broker == brokers.Tradovate ? 'Contracts' : "Quantity", width: 100, editable: false, },
                { field: 'entryPrice', headerName: 'Entry Price', width: 100, editable: false, },
                { field: 'exitPrice', headerName: 'Exit Price', width: 100, editable: false, },
                { field: 'duration', headerName: 'Duration', width: 120, editable: false, },
                { field: 'commission', headerName: 'Commission', width: 100, editable: false, },
                { field: 'netPnL', headerName: 'Net P&L', width: 100, editable: false, },
            ];
        }
        else {
            columns = [
                { field: 'time', headerName: 'תאריך', width: 130, editable: false },
                { field: 'symbol', headerName: 'סמל', width: 100, editable: false },
                { field: 'netROI', headerName: 'רוי נטו', width: 100, editable: false },
                { field: currentAccount?.Broker == brokers.Tradovate ? 'contracts' : "quantity", headerName: currentAccount?.Broker == brokers.Tradovate ? 'חוזים' : "כמות", width: 100, editable: false, },
                { field: 'entryPrice', headerName: 'מחיר כניסה', width: 100, editable: false },
                { field: 'exitPrice', headerName: 'מחיר יציאה', width: 100, editable: false },
                { field: 'duration', headerName: 'זמן עסקה', width: 120, editable: false },
                { field: 'commission', headerName: 'עמלה', width: 100, editable: false },
                { field: 'netPnL', headerName: 'רווח / הפסד נטו', width: 100, editable: false },
            ];

        }
    }




    const handleCellClick = (params) => {
        if (params.field === 'comments') {
            setSelectedComment(params.value);
            setCommendOpen(true);
        }
    };

    const handleCloseCommend = () => {
        setCommendOpen(false);
    };

    function transformTrade(trade) {
        // Calculate the duration in hours, minutes, and seconds format
        const durationInMinutes = trade.duration || 0;
        const absoluteDurationInMinutes = Math.abs(durationInMinutes);
        const hours = Math.floor(absoluteDurationInMinutes / 60);
        const minutes = Math.floor(absoluteDurationInMinutes % 60);
        const seconds = Math.floor((absoluteDurationInMinutes % 1) * 60);

        // Format the duration as a string
        let formattedDuration = '';
        if (hours > 0) {
            formattedDuration += `${hours} Hr `;
        }
        if (minutes > 0) {
            formattedDuration += `${minutes} Min `;
        }
        if (seconds > 0) {
            formattedDuration += `${seconds} Sec`;
        }

        // If all values are zero, display "N/A"
        if (!formattedDuration.trim()) {
            formattedDuration = "N/A";
        }


        return {
            id: trade._id,
            time: trade.entryDate.split('T')[0],
            symbol: trade.symbol,
            netROI: trade.netROI + "%",
            entryPrice: trade.entryPrice,
            exitPrice: trade.exitPrice,
            contracts: trade.contracts,
            duration: formattedDuration,
            commission: trade.commission ? "$" + trade.commission : "N/A",
            netPnL: "$" + trade.netPnL,
        };

    }

    if (trade?.tradesHistory && trade.tradesHistory.length == 0) {
        rows = [transformTrade(trade)];
    }
    else {
        rows = trade.tradesHistory.map((trade, indx) => {


            // Calculate the duration in hours, minutes, and seconds format
            const durationInMinutes = trade.duration || 0;
            const absoluteDurationInMinutes = Math.abs(durationInMinutes);
            const hours = Math.floor(absoluteDurationInMinutes / 60);
            const minutes = Math.floor(absoluteDurationInMinutes % 60);
            const seconds = Math.floor((absoluteDurationInMinutes % 1) * 60);

            // Format the duration as a string
            let formattedDuration = '';
            if (hours > 0) {
                formattedDuration += `${hours} Hr `;
            }
            if (minutes > 0) {
                formattedDuration += `${minutes} Min `;
            }
            if (seconds > 0) {
                formattedDuration += `${seconds} Sec`;
            }

            // If all values are zero, display "N/A"
            if (!formattedDuration.trim()) {
                formattedDuration = "N/A";
            }

            //  if (currentAccount?.Broker === brokers.Tradovate) {
            return {
                id: indx,
                time: trade.entryDate.split('T')[0],
                symbol: trade.symbol,
                netROI: trade.netROI + "%",
                entryPrice: trade.entryPrice,
                exitPrice: trade.exitPrice,
                contracts: trade.contracts,
                duration: formattedDuration,
                commission: trade.commission ? "$" + trade.commission : "N/A",
                netPnL: "$" + trade.netPnL,
            };


        });

    }

    return (
        <div>
            <Modal
                open={handleOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>

                    <Box sx={{ height: 400, width: '95%' }}>
                        <DataGrid
                            id={`${Math.random(1 * 10)}`}
                            rows={rows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            onCellClick={handleCellClick}

                        />
                        <Dialog open={openCommend} onClose={handleCloseCommend}>
                            <DialogTitle>{isHebrew === false ? "Comment" : "הערה"}</DialogTitle>
                            <DialogContent>{selectedComment}</DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseCommend} color="primary"> {isHebrew === false ? "Close" : "סגירה"}</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Box>
            </Modal>

        </div>
    );
}
