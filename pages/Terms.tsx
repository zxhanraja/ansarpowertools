import React from 'react';
import { Scale, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export const Terms: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8">
            <div className="text-center mb-16">
                <p className="text-orange-600 font-bold uppercase tracking-wide text-sm mb-2">Legal</p>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Terms of Service</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Please read these terms carefully before using our services.
                </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Agreement to Terms</h2>
                        <p className="leading-relaxed">
                            By accessing or using the Ansar Power Tools website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Use License</h2>
                        <p className="leading-relaxed">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Ansar Power Tools' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Disclaimer</h2>
                        <p className="leading-relaxed">
                            The materials on Ansar Power Tools' website are provided on an 'as is' basis. Ansar Power Tools makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Governing Law</h2>
                        <p className="leading-relaxed">
                            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500">
                        Last updated: December 2025
                    </p>
                </div>
            </div>
        </div>
    );
};
