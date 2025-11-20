import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { isValidEmail, isValidGSTIN, isValidPhone, ValidationErrors, sanitizeString } from '@/lib/utils/validation';
import { sanitizeObject, createErrorResponse, safeErrorLog } from '@/lib/utils/security';

export async function POST(request: Request) {
  try {
    const { name, email, password, gstin, businessName, businessAddress, phone } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return createErrorResponse('Name, email, and password are required', 400);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse(ValidationErrors.email, 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }

    // Validate GSTIN if provided
    if (gstin && !isValidGSTIN(gstin)) {
      return createErrorResponse(ValidationErrors.gstin, 400);
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return createErrorResponse(ValidationErrors.phone, 400);
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return createErrorResponse('An account with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: sanitizeString(name),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gstin: gstin?.toUpperCase().trim(),
      businessName: businessName ? sanitizeString(businessName) : undefined,
      businessAddress: businessAddress ? sanitizeString(businessAddress) : undefined,
      phone: phone ? phone.replace(/\D/g, '') : undefined,
    });

    // Return sanitized user data (no password, no sensitive fields)
    const safeUser = sanitizeObject(user.toObject());

    return NextResponse.json(
      { 
        message: 'Account created successfully! Please sign in.',
        user: {
          id: safeUser._id,
          name: safeUser.name,
          email: safeUser.email,
          gstin: safeUser.gstin,
          businessName: safeUser.businessName,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = safeErrorLog(error, 'Registration');
    console.error(errorMsg);
    return createErrorResponse('Unable to create account. Please try again later.', 500, errorMsg);
  }
}
