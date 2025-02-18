import { 
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier
} from '@firebase/auth';
import { doc, getDoc } from '@firebase/firestore';
import { auth, db } from './firebase';

export async function loginWithAadhaar(aadhaarNumber: string) {
  try {
    const customerRef = doc(db, 'customers', aadhaarNumber);
    const customer = await getDoc(customerRef);
    
    if (!customer.exists()) {
      throw new Error('Customer not found');
    }
    
    return customer.data().phone;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function setupRecaptcha(phoneNumber: string) {
  try {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved
      }
    });

    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );

    return verificationId;
  } catch (error) {
    console.error('Recaptcha setup error:', error);
    throw error;
  }
}

export async function verifyOTP(verificationId: string, otp: string) {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
} 