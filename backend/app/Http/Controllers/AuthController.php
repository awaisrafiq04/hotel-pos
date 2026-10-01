<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Return user object directly for simplicity as per requirements
        return response()->json($user);
    }

    public function users()
    {
        return response()->json(User::all());
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|unique:users',
            'password' => 'required|min:6',
            'name' => 'required',
            'role' => 'required|in:admin,waiter,chef',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'name' => $validated['name'],
            'role' => $validated['role'],
        ]);

        return response()->json($user, 201);
    }

    public function deleteUser($id)
    {
        User::destroy($id);
        return response()->json(['message' => 'User deleted']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'id' => 'required',
            'current_password' => 'required',
            'new_password' => 'required|min:6',
        ]);

        $user = User::find($request->id);

        if (! $user || ! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function sendOtp(Request $request)
    {
        $email = DB::table('settings')->where('key', 'restaurant_email')->value('value');
        
        if (!$email) {
            return response()->json(['message' => 'Recovery email not configured in settings.'], 400);
        }

        $otp = rand(100000, 999999);
        Cache::put('password_reset_otp', $otp, now()->addMinutes(10));

        $subject = ($restaurant_name ?? 'POS') . " Password Reset OTP";
        
        $message = "
        <html>
        <head>
        <style>
            .email-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f9f9f9;
                padding: 40px;
                border-radius: 15px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .content {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }
            .otp-box {
                background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
                color: white;
                font-size: 36px;
                font-weight: bold;
                text-align: center;
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
                letter-spacing: 8px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #888;
                font-size: 12px;
            }
        </style>
        </head>
        <body>
            <div class='email-container'>
                <div class='header'>
                    <h1 style='color: #333; margin: 0;'>Account Recovery</h1>
                </div>
                <div class='content'>
                    <p style='color: #666; font-size: 16px; line-height: 1.5;'>Hello,</p>
                    <p style='color: #666; font-size: 16px; line-height: 1.5;'>We received a request to reset your POS account password. Use the verification code below to proceed:</p>
                    <div class='otp-box'>{$otp}</div>
                    <p style='color: #666; font-size: 14px;'>This code is valid for <b>10 minutes</b>. If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div class='footer'>
                    <p>&copy; 2026 Awais Rafiq POS. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Awais Rafiq POS <noreply@awaisrafiqpos.com>" . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        if(mail($email, $subject, $message, $headers)) {
            $msg = 'OTP sent to ' . $email;
            if (env('APP_DEBUG')) {
                $msg .= " (Debug OTP: {$otp})";
            }
            return response()->json(['message' => $msg]);
        } else {
            // Even if mail fails, show the OTP in debug mode so user isn't stuck
            if (env('APP_DEBUG')) {
                return response()->json(['message' => "Mail failed but here is your Debug OTP: {$otp}"], 200);
            }
            return response()->json(['message' => 'Email delivery failed. Please check your server mail configuration.'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'otp' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $cachedOtp = Cache::get('password_reset_otp');

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        // Find the admin user to reset
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            return response()->json(['message' => 'Admin user not found'], 404);
        }

        $admin->password = Hash::make($request->password);
        $admin->save();

        Cache::forget('password_reset_otp');

        return response()->json(['message' => 'Password reset successfully']);
    }
}
