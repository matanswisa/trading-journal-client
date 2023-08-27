import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Iconify from '../../iconify/Iconify';

import MenuItem from '@mui/material/MenuItem';

import Select from '@mui/material/Select';
import { useEffect, useState, useRef } from 'react';
import api from '../../../api/api'
import Papa from 'papaparse';

import { configAuth } from '../../../api/configAuth';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentAccount, selectUser, setTradesList } from '../../../redux-toolkit/userSlice';
import StepperModal from '../ExplanationOfImportTrades/StepperModal';
import {

  IconButton,
  TextField

} from '@mui/material';
import Process from '../../processBar/process'

import BinanceIcon from '../../brokersIcons/binance.svg'
import TradeovateIcon from '../../brokersIcons/Tradovate.svg'
import { brokers } from '../../brokersNames/brokers';

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
  const [showStepper, setShowStepper] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [processDuration, setProcessDuration] = useState(2000);
  const [uploadStarted, setUploadStarted] = useState(false);
  const handleIconButtonClick = () => {
    // Set showAnotherComponent to true to display AnotherComponent
    setShowStepper(true);
  };






  const dispatch = useDispatch();
  const handleOpen = () => props.handleOpenModal(true);
  const handleClose = () => props.handleOpenModal(false);
  const { notifyToast } = props;

  const currentAccount = useSelector(selectCurrentAccount)

  const [broker, setBroker] = React.useState(currentAccount.broker);

  // const handleChange = (event) => {
  //   setBroker(event.target.value);
  // };

  const user = useSelector(selectUser);
  const fileInputRefTrade = useRef(null);



  const validationBeforeImportCsvFileFromTradeovate = (file) => {
    const requiredColumnsTradeOvate = [
      "Position ID",
      "Timestamp",
      "Trade Date",
      "Net Pos",
      "Net Price",
      "Bought",
      "Avg. Buy",
      "Sold",
      "Avg. Sell",
      "Account",
      "Contract",
      "Product",
      "Product Description",
      "_priceFormat",
      "_priceFormatType",
      "_tickSize",
      "Pair ID",
      "Buy Fill ID",
      "Sell Fill ID",
      "Paired Qty",
      "Buy Price",
      "Sell Price",
      "P/L",
      "Currency",
      "Bought Timestamp",
      "Sold Timestamp"
    ];



    let validationPassed = true;

    if (!file.name.endsWith('.csv')) {
      validationPassed = false;
      notifyToast('Please select a CSV  file.', 'error');
      return false; // Validation failed
    }


    Papa.parse(file, {
      complete: (result) => {
        const headers = result.data[0]; // Assuming the first row contains column headers

        // Check if all required columns are present
        const missingColumns = requiredColumnsTradeOvate.filter(column => !headers.includes(column));
        if (missingColumns.length > 0) {
          notifyToast('Please select the correct file.', 'error');
          validationPassed = false; // Validation failed
        } else {
          // Validation passed
          validationPassed = true;
        }
      }
    });

    return validationPassed;
  };




  const validationBeforeImportCsvFileFromBinance = (file) => {

    let validationPassed = true;

    if (!file.name.endsWith('.xlsx')) {
      validationPassed = false;
      notifyToast('Please select a  Excel file.', 'error');
      return false; // Validation failed
    }

    if (!file.name.includes('Export Trade History')) {
      validationPassed = false;
      notifyToast('File name should  be "Export Trade History".', 'error');
      return false; // Validation failed
    }

    return validationPassed;
  };





  const handleFileChangeTrade = async (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      let isValidFile;

      if (currentAccount?.Broker === brokers.Tradovate) {

        isValidFile = validationBeforeImportCsvFileFromTradeovate(file);
      }

      else if (currentAccount?.Broker === brokers.Binance) {
        isValidFile = validationBeforeImportCsvFileFromBinance(file);
      }

      if (!isValidFile) {
        return; // Stop further execution
      }


      try {
        setIsUploading(true);
        setUploadStarted(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user._id);
        formData.append('accountId', currentAccount._id);

        const token = localStorage.getItem('token');
        const headersForImportTrades = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }

        const timer = setInterval(() => {
          setProcessDuration((prevDuration) => Math.min(prevDuration + 2000, 10000)); // Cap at 10 seconds
        }, 2000);


        const response = await api.post('/api/importTrades', formData, headersForImportTrades);

        clearInterval(timer); // Clear the timer when upload is complete
        setProcessDuration(3000); // Reset process duration
        dispatch(setTradesList(response.data.trades));
        if (response.data.isAllUploaded) {
          notifyToast(response.data.message, 'success');
        } else {
          notifyToast(response.data.message, 'warning');

        }

        setProcessDuration(1000); // Reset process duration
        handleClose();
        // Handle success or show a success message to the user
      } catch (error) {
        setIsUploading(false);
        console.error('Error uploading file:', error);
        notifyToast('Error uploading file' + error.message, 'error');
        // Handle error or show an error message to the user
      } finally {
        setIsUploading(false);
        setUploadStarted(false);
        setProcessDuration(2000); // Reset process duration
      }

    }
  };

  useEffect(() => {
    let interval;

    if (uploadStarted) {
      interval = setInterval(() => {
        if (processDuration < 10000) {
          // Increase process duration up to a maximum of 10 seconds
          setProcessDuration((prevDuration) => prevDuration + 2000);
        } else if (processDuration >= 4000 && processDuration < 6000) {
          // Close the process bar after it reaches 40%
          clearInterval(interval);
          setIsUploading(false);
          setUploadStarted(false);
          setProcessDuration(2000); // Reset process duration
        }
      }, 2000);
    } else {
      clearInterval(interval); // Clear the interval when upload is not started
    }

    return () => clearInterval(interval);
  }, [uploadStarted, processDuration]);

  const handleImportTrade = () => {
    // Trigger the file input selection when the button is clicked
    fileInputRefTrade.current.click();
  };
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
            import Trades
          </Typography>

          <TextField
            sx={{ mt: 3 }}
            label="Broker"
            disabled

            InputProps={{
              startAdornment: (
                <img
                  src={currentAccount?.Broker === brokers.Tradovate ? TradeovateIcon : BinanceIcon}

                  width={144}
                  height={54}
                  style={{ marginRight: '8px' }}
                />
              ),
            }}
          />


          {isUploading ? (
            <Process duration={processDuration} />
          ) : (
            <>
              <Button
                sx={{ mt: 5 }}
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

              <IconButton size="large" color="inherit" onClick={handleIconButtonClick}>
                <Iconify icon={'eva:question-mark-circle-outline'} />
              </IconButton>

              {showStepper && <StepperModal name={currentAccount?.Broker} handleOpenModal={setShowStepper} />}
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}