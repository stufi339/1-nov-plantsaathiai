import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Leaf, Mail, Phone, Lock, User, Loader2 } from 'lucide-react';
import { supabaseAuthService } from '@/lib/supabaseAuthService';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Email/Password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Phone OTP state
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // Handle email sign up
    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { user, error } = await supabaseAuthService.signUp(email, password, fullName);

            if (error) {
                toast({
                    title: 'Sign Up Failed',
                    description: error.message,
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Success!',
                    description: 'Account created. Please check your email to verify.',
                });
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle email sign in
    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { user, error } = await supabaseAuthService.signIn(email, password);

            if (error) {
                // Handle specific error cases
                if (error.message.includes('Email not confirmed')) {
                    toast({
                        title: 'Email Not Verified',
                        description: 'Please check your email and click the verification link.',
                        variant: 'destructive'
                    });
                } else {
                    toast({
                        title: 'Sign In Failed',
                        description: error.message,
                        variant: 'destructive'
                    });
                }
            } else {
                toast({
                    title: 'Welcome back!',
                    description: 'Successfully signed in.',
                });
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle phone OTP request
    const handlePhoneOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabaseAuthService.signInWithPhone(phone);

            if (error) {
                toast({
                    title: 'Failed to Send OTP',
                    description: error.message,
                    variant: 'destructive'
                });
            } else {
                setOtpSent(true);
                toast({
                    title: 'OTP Sent!',
                    description: 'Check your phone for the verification code.',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP verification
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { user, error } = await supabaseAuthService.verifyOtp(phone, otp);

            if (error) {
                toast({
                    title: 'Verification Failed',
                    description: error.message,
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Success!',
                    description: 'Phone verified successfully.',
                });
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <Leaf className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Plant Saathi AI</CardTitle>
                    <CardDescription>
                        Your intelligent farming companion
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="phone">Phone</TabsTrigger>
                        </TabsList>

                        {/* Sign In Tab */}
                        <TabsContent value="signin">
                            <form onSubmit={handleEmailSignIn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signin-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="signin-email"
                                            type="email"
                                            placeholder="farmer@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signin-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="signin-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Sign Up Tab */}
                        <TabsContent value="signup">
                            <form onSubmit={handleEmailSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            placeholder="Ramesh Kumar"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="farmer@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Phone OTP Tab */}
                        <TabsContent value="phone">
                            {!otpSent ? (
                                <form onSubmit={handlePhoneOTP} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Include country code (e.g., +91 for India)
                                        </p>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            'Send OTP'
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">Verification Code</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            Enter the 6-digit code sent to {phone}
                                        </p>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full"
                                        onClick={() => setOtpSent(false)}
                                    >
                                        Change Phone Number
                                    </Button>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Trusted by farmers across India 🌾</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
