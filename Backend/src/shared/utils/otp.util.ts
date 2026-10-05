import crypto from 'crypto';

export const generateOtp = (length: number = 6): string => {
  // Generate random digits (e.g. 6 digits: 100000 to 999999)
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const verifyOtp = (plainOtp: string, hashedOtp: string): boolean => {
  const incomingHash = hashOtp(plainOtp);
  return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashedOtp));
};
