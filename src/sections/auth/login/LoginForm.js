import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Stack, IconButton, InputAdornment, TextField, Typography, } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import api, { axiosAuth, axiosNoAuth } from '../../../api/api';
import { login } from '../../../redux-toolkit/userSlice';
import { useDispatch } from 'react-redux';
import useToast from '../../../hooks/alert';
import { ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { selectidx } from '../../../redux-toolkit/languagesSlice';
import { selectMessages } from '../../../redux-toolkit/messagesSlice'
import { getMsg } from '../../../utils/messeageUtils';
import { msgType } from '../../../utils/messagesEnum.js';
import { msgNumber } from '../../../utils/msgNumbers.js';
import { Button } from 'rsuite';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// ----------------------------------------------------------------------

export default function LoginForm(props) {

  const showToast = useToast();
  const notifyToast = (Msg, Type) => {

    showToast(Msg, Type);
  }

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const languageidx = useSelector(selectidx);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [show1TimePasswordForm, setShow1TimePasswordForm] = useState(false);
  const messages = useSelector(selectMessages);
  console.log(messages);
  const handleLoginForm = () => {
    if (!username || !password) return;

    axiosAuth.post('/api/auth/login', { username, password }).then((res) => {

      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(login(res.data));
      navigate('/dashboard/app', { replace: true });
    }).catch((err) => {
      console.log(err);
      // console.log(err.response.data.isLicenseExpired);
      if (err.response && err.response.data && err.response.data.isLicenseExpried) {
        notifyToast(getMsg(messages, msgType.warnings, msgNumber[30], languageidx).msgText, getMsg(messages, msgType.warnings, msgNumber[30], languageidx).msgType);
        // notifyToast("Your license has expired. Please renew it to continue using the service.", "info");
      } else {
        notifyToast(getMsg(messages, msgType.warnings, msgNumber[14], languageidx).msgText, getMsg(messages, msgType.warnings, msgNumber[14], languageidx).msgType);
        // Toast("Sorry, One or more login details are incorrect. Please try again.", "error");
      }

    })
  };


  const validateChangePasswordForm = () => {

    const password1 = document.getElementById('input-with-icon-textfield-change-password-1').value;
    const password2 = document.getElementById('input-with-icon-textfield-change-password-2').value;

    if (password1 === password2) {

      alert("password  same");
    }
    else {
      setErrorMessage("passwords must be same");

    }

  }


  const validate1TimePassword = () =>
  {
    const onetimepassword = document.getElementById('input-with-icon-textfield-change-password-1timepassword').value;
   
    api
    .post('/api/auth/validate1timepass', {
      password: onetimepassword,

    })
    .then(async (response) => {

      
      if (response.status === 200) {
      
      }
    

    })
    .catch((error) => {
      console.error('user not exist:', error);
      setErrorMessage("1 time password not correct");

    });
  }



  //this function check if user name or email exist in db
  const validateForgotPaswordForm = () => {

    const usernameOrEmail = document.getElementById('input-with-icon-textfield').value;

    // Check if the input field is empty
    if (!usernameOrEmail) {
      // The field is empty, you can display an error message or take appropriate action
      setErrorMessage('Please enter your username or email.');
      return; // Prevent further processing if the field is empty
    }

    api
      .post('/api/auth/checkUserExist', {
        info: usernameOrEmail,

      })
      .then(async (response) => {

        //after username or email exist id db we send email and change page 
        if (response.status === 200) {
          // alert("please open the link in your mail");
          setShow1TimePasswordForm(true);
          // setShowResetPasswordForm(true);
        }

      })
      .catch((error) => {
        console.error('user not exist:', error);
        setErrorMessage("please conantct with site serivce");

      });


  };

  return (
    <>
      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}



      {show1TimePasswordForm === true  /// this form show after user click "forgot password and after insert valid username or email exist in db"


        ? (<div>

          <Typography variant="h4" component="h3" style={{ color: 'black', fontWeight: 'inherit', cursor: 'pointer' }}>
            Auth Password
          </Typography>

          <Box sx={{ width: 600, height: 500, backgroundColor: '#fff', border: '1px solid lightgrey' }}>

            <Box>
              <Typography variant="h6" component="h3" style={{marginLeft: '18px', marginTop: '10px', marginBottom: '30px', color: 'black', fontWeight: 'inherit', fontSize: '15px' }}>
                To complete your action, please enter the one-time password that has been sent to your email address.
              </Typography>

            </Box>

            <Box  >
              <TextField
                id="input-with-icon-textfield-change-password-1timepassword"
                label="Password"
                type='password'
                style={{ marginTop: '30px', marginBottom: '270px', marginLeft: '18px', width: '90%', fontSize: '15px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">

                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />
            </Box>

            <Box>
              <Button variant="contained" href="#contained-buttons" style={{ marginLeft: '18px', fontSize: '20px', color: 'black' }} onClick={validate1TimePassword}>
                Sumbit
              </Button>
            </Box>
          </Box>





        </div>) : // this form show after user click "forgot password" 
        (showForgotPassword === true ? <div>


          <Typography variant="h4" component="h3" style={{ color: 'black', fontWeight: 'inherit', cursor: 'pointer' }}>
            Forgot password
          </Typography>

          <Box sx={{ width: 600, height: 500, backgroundColor: '#fff', border: '1px solid lightgrey' }}>

            <Box>
              <Typography variant="h6" component="h3" style={{ color: 'black', fontWeight: 'inherit', fontSize: '16px', marginLeft: '18px', marginBottom: '30px', marginTop: '20px' }}>
                Lost your password? Please enter your username or email address. You will receive a link to create a new password via email.
              </Typography>
            </Box>

            <Box  >
              <TextField
                id="input-with-icon-textfield"
                label="Username or email"
                style={{ marginBottom: '30px', marginLeft: '18px', width: '90%', fontSize: '15px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">

                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />
            </Box>


            <Box>
              <Button variant="contained" href="#contained-buttons" style={{ marginBottom: '235px', marginLeft: '18px', fontSize: '20px', color: 'black' }} onClick={validateForgotPaswordForm}>
                Reset Password
              </Button>
            </Box>

            <Box>
              <Link variant="body1" onClick={() => setShowForgotPassword(!showForgotPassword)} style={{ fontWeight: 'inherit', fontSize: '18px', marginLeft: '18px', cursor: 'pointer' }}   >
                Remember your password?
              </Link>
            </Box>

          </Box>





        </div> :
          //this form is login page 
          <div>
            <Stack spacing={3}>

              <ToastContainer />
              <TextField inputProps={{ style: { color: 'black' } }} name="User Name" value={username} onChange={(e) => setUsername(e.target.value)} />

              <TextField InputLabelProps={{
                style: { color: 'black' }, // Set the label color to black
              }}
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{ style: { color: 'black' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 3 }}>


            </Stack>
            <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleLoginForm} style={{ marginBottom: '22px' }}>
              Login
            </LoadingButton>

            <Grid >
              <Link variant="body2" onClick={() => setShowForgotPassword(!showForgotPassword)} style={{ cursor: 'pointer' }}  >
                Forgot password?
              </Link>
            </Grid>
          </div>)
      }
    </>

  );
}
