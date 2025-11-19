export const credentials = {
  validUser: { email: 'kumar', password: 'Test@123' },
  forgotPassword: {
    knownEmail: 'qa+knownuser@mailinator.com',
    unknownEmail: 'qa+unknown@mailinator.com',
    invalidEmails: ['plainaddress', '@no-local-part.com', 'user@', 'user@domain', 'user@domain..com'],
  },
};

export const passwordScenarios = {
  weak: ['abc', 'password', '1234567'],
  noSpecial: ['Abcdef12', 'Password11'],
  noNumber: ['Password@', 'Strong@Pwd'],
  noUpper: ['strong@123', 'valid@123'],
  noLower: ['STRONG@123', 'VALID@123'],
  mismatch: { newPassword: 'Strong@123', confirmPassword: 'Strong@124' },
  valid: ['Str0ng@123', 'V@lidPassw0rd'],
};



