import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Iconify from '../iconify/Iconify';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect, useState, useRef } from 'react';
import api from '../../api/api'
import Papa from 'papaparse';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column', // Make sure the content is in a column
};


export default function BasicModal(props) {





  const handleOpen = () => props.handleOpenModal(true);
  const handleClose = () => props.handleOpenModal(false);
  const { notifyToast } = props;

  const [broker, setBroker] = React.useState(1);

  const handleChange = (event) => {
    setBroker(event.target.value);
  };





  // /////////////////////import trades///////////////////
  const [selectedFile, setSelectedFile] = useState(null);

  const [csvData, setCsvData] = useState(null);
  const fileInputRefTrade = useRef(null);

  const isCSVFile = (file) => {
    return file.type === 'text/csv' || file.name.endsWith('.csv');
  };

  const isValidColumnNames = (data) => {
    // Add your updated validation logic for column names here
    const requiredColumns = [
      'Position ID', 'Timestamp', 'Trade Date', 'Net Pos', 'Net Price', 'Bought',
      'Avg. Buy', 'Sold', 'Avg. Sell', 'Account', 'Contract', 'Product', 'Product Description',
      '_priceFormat', '_priceFormatType', '_tickSize', 'Pair ID', 'Buy Fill ID', 'Sell Fill ID',
      'Paired Qty', 'Buy Price', 'Sell Price', 'P/L', 'Currency', 'Bought Timestamp', 'Sold Timestamp'
    ];
    return requiredColumns.every((col) => data[0].hasOwnProperty(col));
  };


  const handleFileChangeTrade = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      if (!isCSVFile(file)) {
        notifyToast("Invalid file format. Please select a CSV file.", "error");
        return;
      }

      // Use FileReader to read the file contents
      const reader = new FileReader();
      reader.onload = () => {
        // Parse the CSV data using papaparse
        const result = Papa.parse(reader.result, {
          header: true,
          dynamicTyping: true,
        });

        if (!isValidColumnNames(result.data)) {
          notifyToast("Please ensure the CSV file has corrent ,when import trade from tradeovate file name need to be : Position History ", "error");
          return;
        }

        // Store the parsed data in the state variable
        setCsvData(result.data);
        handleSaveTrade(result.data);
        //call api to add new trades.
      };

      reader.readAsText(file);
    }
    console.log(csvData);
  };

  const handleImportTrade = () => {
    // Trigger the file input selection when the button is clicked
    fileInputRefTrade.current.click();
  };

  useEffect(() => {

  }, [csvData]);







  const handleSaveTrade = async (csvData) =>
   {

    const count = csvData.length; // Total number of trades
    let successCount = 0;

      for (let i = 0; i < csvData.length; i++) {

          const data = {
            entryDate: csvData[i]["Bought Timestamp"] || "",
            symbol: csvData[i]["Product"] || "",
            status: csvData[i]["P/L"] < 0 ? "Loss" : "Win" || "",
            netROI: "",
            stopPrice: 0,
            longShort: csvData[i]["Buy Price"] < csvData[i]["Sell Price"] ? "Long" : "Short" || "",
            contracts: csvData[i]["Bought"] || "",
            entryPrice: csvData[i]["Buy Price"] || "",
            exitPrice: csvData[i]["Sell Price"] || "",
            duration: "",
            commission: "",
            comments: "",
            netPnL: csvData[i]["P/L"] || "",
            tradeId: "",
          }
        
          const boughtTimestamp = new Date(csvData[i]["Bought Timestamp"]);
          const soldTimestamp = new Date(csvData[i]["Sold Timestamp"]);
          const timeDifferenceInMinutes = (soldTimestamp - boughtTimestamp) / (1000 * 60);
          data.duration = timeDifferenceInMinutes || "";



          
              await api
                .post('/api/importTrades', data).then((res) => {
                  props.updateTradeLists()
                 
                  handleClose();
                     successCount++;
                }).catch((err) => {
                  const errorMessage = "Couldn't add trade: " + csvData[i]["Product"] + " - " + csvData[i]["Timestamp"];
                  notifyToast(errorMessage, "error");
                
                })
        
              }
  
              if (successCount === count) {
                notifyToast(`All ${count} trades added successfully`, "success");
              } else {
                notifyToast(`${successCount} out of ${count} trades added successfully`, "success");
              }


  
}


  ////////////////////////////////////////////////////////////








  return (
    <div>

      <Modal
        open={handleOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            import Trades          </Typography>




          <Select sx={{ mt: 3 }}
            name="broker"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={broker}
            label="broker"
            onChange={handleChange}
            inputProps={{
              name: 'age',
              id: 'uncontrolled-native',
            }}

          >
            <MenuItem value={1}>Tradovate</MenuItem>
            <MenuItem value={2}>Ninja Trader</MenuItem>
            <MenuItem value={3}>Interactiv</MenuItem>
          </Select>
          <Button sx={{ mt: 5 }}
            size="medium"
            variant="contained"
            component="span"
            startIcon={<Iconify icon={'eva:file-add-outline'} />}
            onClick={handleImportTrade}
          >
            Import
          </Button>
          <input
            type="file"
            ref={fileInputRefTrade}
            style={{ display: 'none' }}
            onChange={handleFileChangeTrade}
          />
        </Box>
      </Modal>
    </div>
  );
}