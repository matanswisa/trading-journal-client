import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import api from '../../api/api';
import { useEffect } from 'react';
import { Select, MenuItem, ListItemIcon, Alert } from '@mui/material';
import {red,blue,green,yellow,orange,purple,pink,cyan,brown,lightGreen,lime,blueGrey,} from '@mui/material/colors';
import { Grid } from 'rsuite';
import { selectUser, setCurrentAccount, updateAccountList, selectUserAccounts } from '../../redux-toolkit/userSlice';
import { configAuth } from '../../api/configAuth';
import BinanceIcon from '../brokersIcons/binance.svg'
import TradeovateIcon from '../brokersIcons/Tradovate.svg'
import { useDispatch, useSelector } from 'react-redux';
import {selectMessages} from '../../redux-toolkit/messagesSlice';
import {getMsg} from '../../utils/messeageUtils';
import { msgType} from '../../utils/messagesEnum.js';
import {msgNumber} from '../../utils/msgNumbers.js';

//--------------------------------------------This component show Create account Modal -------------------------------------------//
export default function AccountModal(props) {

//------------------------------------------------  States ----------------------------------------------------- //
  const accounts = useSelector(selectUserAccounts);
  const handleOpen = () => props.handleOpenModal(true);
  const handleClose = () => props.handleOpenModal(false);
  const [accountName, setAccountName] = useState('');
  const [selectedColor, setSelectedColor] = useState(red[500]);
  const [broker, setBroker] = React.useState(1);
  const messages = useSelector(selectMessages);
  const { notifyToast } = props;
  const { edit } = props;
  const { accountInfo } = props;
  const user = useSelector(selectUser);
  const dispatch = useDispatch();


//handle state of broker when change in select option
  const handleChange = (event) => {
    setBroker(event.target.value);
  };



  useEffect(() => {
    if (accountInfo && typeof accountInfo === 'object') {
      setAccountName(accountInfo.AccountName || '');
      setSelectedColor(accountInfo.Label || '');
    }
  }, [accountInfo]);


//this function check if account name already exist before created.
  const checkAccountExists = (accountList, accountName) => {
    const selectedAccount = accountList.find((account) => account.AccountName === accountName);
    return selectedAccount !== undefined;
  };


//------------------------------------------------ handle create account -----------------------------------------------------//
const handleCreateAccount = async () => {
    if (validateForm())
     {
      const data = { AccountName: accountName, Broker: broker,Label: selectedColor,};
      await api
        .post('/api/createAccount', { userId: user._id, data }, configAuth)
        .then(async (res) => {
          notifyToast(getMsg(messages,msgType.success,msgNumber[2]).msgText, getMsg(messages,msgType.success,msgNumber[2]).msgType);
          // notifyToast('Account added successfully', 'success');
          props.handleOpenModal(false);
          dispatch(updateAccountList(res.data))
          dispatch(setCurrentAccount(res.data[res.data.length - 1]));
        })
        .catch((err) => {
          notifyToast(getMsg(messages,msgType.errors,msgNumber[1]).msgText, getMsg(messages,msgType.errors,msgNumber[1]).msgType);
          // notifyToast("Couldn't add Account", 'error');
          return false;
        });
    }
  };


//------------------------------------------------ handle edit account -----------------------------------------------------//
  const handleEditAccount = async () => {
    if (validateFormEdit()) {
      const data = {
        accountId: accountInfo._id, // Include the _id property for updating the correct account
        AccountName: accountName,
        Broker: broker,
        Label: selectedColor,
        userId: user._id,
      };
      await api
        .put('/api/editAccount', data, configAuth) // Use api.put and pass the account id in the URL
        .then((res) => {
          // notifyToast('Account updated successfully', 'success');
          notifyToast(getMsg(messages,msgType.success,msgNumber[3]).msgText, getMsg(messages,msgType.success,msgNumber[3]).msgType);
          props.handleOpenModal(false);
          // props.fetchAccounts();
          dispatch(updateAccountList(res.data))

        })
        .catch((err) => {
          notifyToast(getMsg(messages,msgType.errors,msgNumber[3]).msgText, getMsg(messages,msgType.errors,msgNumber[3]).msgType);
          // notifyToast("Couldn't update account", 'error');
        });
    }
  };


//------------------------------------------------ handle style for create account modal -----------------------------------------------------//  
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '22%',
    minWidth: '300px', // Adjust the size as needed
    height: '55vh', // Increase the height to 80% of the viewport height
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // Align buttons to the right
  };


//------------------------------------------------ handle validateForm before create account -----------------------------------------------------//  
  const validateForm = () => {
    if (accountName === '') {
      notifyToast(getMsg(messages,msgType.warnings,msgNumber[1]).msgText, getMsg(messages,msgType.warnings,msgNumber[1]).msgType);
      // notifyToast('Account type is missing', 'warning');
      return false;
    }

    if (checkAccountExists(accounts, accountName)) {
      notifyToast(getMsg(messages,msgType.warnings,msgNumber[2]).msgText, getMsg(messages,msgType.warnings,msgNumber[2]).msgType);
      // notifyToast('Account already exist', 'warning');
      return false;
    }
    return true;
  };

//------------------------------------------------ handle validateForm before edit account -----------------------------------------------------//  
  const validateFormEdit = () => {
    if (accountName === '' ) {
      notifyToast(getMsg(messages,msgType.warnings,msgNumber[1]).msgText, getMsg(messages,msgType.warnings,msgNumber[1]).msgType);
      // notifyToast('Account type is missing', 'warning');
      return false;
    }
    return true;
  };


  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Box sx={style}>
      <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {edit === true ? (
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ textAlign: 'left', marginTop: 0 }}>
              Update Account
            </Typography>
          ) : (
            <Typography id="modal-modal-title" variant="h4" component="h2" sx={{ textAlign: 'left', marginTop: 0 }}>
              Create Account
            </Typography>
          )}
        </Grid>

        <Grid sx={{ display: 'flex', justifyContent: 'space-between', mt: 2  }}>
          <Typography variant="h6" component="h3" sx={{ textAlign: 'left', marginTop: 2 }}>
            Account Name
          </Typography>
          <TextField
          
            required
            id="outlined-required"
            value={accountName}
            sx={{ mr: 2 }}
            defaultValue={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </Grid>
        {edit === false ?
        <Grid  sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }} >
        <Typography variant="h6" component="h3" sx={{ textAlign: 'left', marginTop: 2}}>
            Broker
          </Typography>
          <Select
            sx={{ mt: 3, ml: 2 }}
            name="broker"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={broker}
            label="broker"
            defaultValue={broker}
            onChange={handleChange}
            inputProps={{
              name: 'age',
              id: 'uncontrolled-native',
            }}
          >
            <MenuItem value={1}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={TradeovateIcon} // Use the imported SVG component here
                  alt="Binance"
                  width={140}
                  height={30}
                  style={{ marginRight: '8px' }}
                />

              </div>
            </MenuItem>
            <MenuItem value={2}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={BinanceIcon} // Use the imported SVG component here
                  alt="Binance"
                  width={100}
                  height={30}
                  style={{ marginRight: '8px' }}
                />

              </div>
            </MenuItem>
            {/* <MenuItem value={3}>Interactiv</MenuItem> */}
          </Select>

        </Grid>  : ''}

        <Grid  sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }} >
        <Typography variant="h6" component="h3" sx={{ textAlign: 'left', marginTop: 2 }}>
            Account Symbol
          </Typography>
        <Select sx={{ mt: 3, ml: 2 }} size="small" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>
          <MenuItem value={red[500]}></MenuItem>
          <MenuItem value={red[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: red[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={blue[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: blue[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={green[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: green[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={brown[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: brown[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>

          <MenuItem value={yellow[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: yellow[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={orange[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: orange[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={purple[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: purple[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={pink[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: pink[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={cyan[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: cyan[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={lightGreen[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: lightGreen[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={lime[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: lime[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
          <MenuItem value={blueGrey[500]}>
            <ListItemIcon>
              <div style={{ backgroundColor: blueGrey[500], width: '24px', height: '24px' }}></div>
            </ListItemIcon>
          </MenuItem>
        </Select>

          </Grid>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            position: 'absolute',
            bottom: '16px',
            right: '16px',
          }}
        >
          <Button variant="outlined" size="medium" onClick={handleClose}>
            Cancel
          </Button>

          <Button onClick={edit === true ? handleEditAccount : handleCreateAccount} variant="contained" size="medium">
            {edit === true ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </div>
  );
}
