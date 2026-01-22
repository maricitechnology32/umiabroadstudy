/**
 * Bank Statement Template Configurations
 * Each template defines the structure and styling for a specific bank's statements
 */

export const BANK_TEMPLATES = {
    sarbeshwor: {
        id: 'sarbeshwor',
        name: 'Sarbeshwor Saving & Credit Co-operative Ltd.',
        nameNepali: null,
        location: 'Kalanki-14, Kathmandu, Nepal',
        locationNepali: null,

        // Contact Information
        contact: {
            phone: '01-5219644',
            email: null,
            registration: 'Regd. No. 2256/063/5066'
        },

        // Visual Design
        design: {
            // Header styling
            header: {
                enabled: true, // Show colored bar with company info
                backgroundColor: '#5B7A9E',
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-left'
            },

            // Footer styling
            footer: {
                enabled: true, // Show colored bar at bottom
                backgroundColor: '#5B7A9E',
                textColor: '#FFFFFF',
                layout: 'single', // single, dual, triple
                showPageNumbers: true
            },

            // Color theme
            colors: {
                primary: '#5B7A9E',
                text: '#000000',
                border: '#CCCCCC'
            },

            // Watermark
            watermark: {
                enabled: false // No watermark when printing on letterhead
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: 'To Whom It May Concern',

            // Field labels
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR',
                interestRate: 'Interest Rate',
                taxRate: 'Tax Rate',
                accountOpening: 'A/C Opening Date'
            },

            // What fields to show
            fields: {
                showInterestRate: false,
                showTaxRate: false,
                showAccountOpening: false
            },

            // Layout
            layout: {
                detailsBoxed: false, // Whether account details are in a box
                signaturePosition: 'right' // left, right, center
            },

            // Text templates
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below:',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement of Account',

            // Account info layout
            accountInfo: {
                boxed: true, // Account summary in bordered box
                layout: 'table' // table, list
            },

            // Transaction table
            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Particulars', align: 'left', width: '35%' },
                    { key: 'reference', label: 'Cheque No', align: 'center', width: '10%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '14%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '14%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '15%' }
                ],
                borders: 'standard' // standard, full, minimal
            },

            // Summary section
            summary: {
                format: 'table', // table, list, horizontal
                layout: 'three-column', // three-column, four-column
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance',
                    opening: 'Opening Balance'
                }
            },

            // Signature
            signature: {
                position: 'right', // left, right, center
                showName: false, // Just "Authorized Signature"
                showTitle: false
            }
        },

        // Transaction descriptions based on template analysis
        transactionDescriptions: {
            deposits: [
                'CASH DEPOSIT',
                'Cash Deposit by Self',
                'Cash Deposit by Bimal Bhusal',
                'Cash Deposit by Sita Pandey'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== DEVIPUR TEMPLATE ==========
    devipur: {
        id: 'devipur',
        name: 'Shree Devipur Multipurpose Co-operative Society Ltd.',
        nameNepali: 'श्री देविपुर बहुउद्देश्यीय सहकारी संस्था लि.',
        location: 'Butwal-13, Rupandehi',
        locationNepali: 'बुटवल-१३, रुपन्देही',
        established: 'स्था: २०७८',

        // Contact Information
        contact: {
            phone: '071-591554',
            email: '78sdmcsl7879@gmail.com',
            registration: 'दर्ता नं ७८ ।३९४१। ०७८/०७९'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#008B8B',
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-right'
            },
            footer: {
                enabled: true,
                backgroundColor: '#006666',
                textColor: '#FFFFFF',
                layout: 'triple',
                showPageNumbers: true
            },
            colors: {
                primary: '#008B8B',
                text: '#000000',
                titleColor: '#006666',
                border: '#CCCCCC'
            },
            watermark: {
                enabled: false
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: 'To Whom It May Concern',
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR',
                interestRate: 'Interest Rate',
                taxRate: 'Tax Rate'
            },
            fields: {
                showInterestRate: true,
                showTaxRate: true,
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'right'
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below.',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement',

            accountInfo: {
                boxed: false,
                layout: 'inline'
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'right', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                borders: 'minimal'
            },

            summary: {
                format: 'horizontal',
                layout: 'three-column',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance'
                }
            },

            signature: {
                position: 'right',
                showName: true,
                showTitle: true,
                name: 'Raju Thapa',
                title: 'Manager'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Bimal Khadka',
                'Cash Deposit by Suman Khadka',
                'Cash Deposit by Kalpana Pandey',
                'Cash Deposit by Bimal Bhusal',
                'Cash Deposit by Sita Pandey'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== PRABHABKARI TEMPLATE ==========
    prabhabkari: {
        id: 'prabhabkari',
        name: 'Prabhabkari Krishi Sahakari Sanstha Ltd.',
        nameNepali: null,
        location: 'Tulsipur-7, Dang',
        locationNepali: null,
        established: null,

        // Contact Information
        contact: {
            phone: '+977-9807544428',
            email: 'prabhabkarikrishi073@gmail.com',
            registration: 'Regd. No.: 69/2072/073'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#1e3a8a', // Dark blue
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-right'
            },
            footer: {
                enabled: true,
                backgroundColor: '#1e3a8a',
                textColor: '#FFFFFF',
                layout: 'email-only', // Just email in footer
                showPageNumbers: true,
                pageFormat: 'x-of-y' // "Page 1 of 2" format
            },
            colors: {
                primary: '#1e3a8a', // Dark blue
                text: '#000000',
                titleColor: '#1e3a8a',
                border: '#000000'
            },
            watermark: {
                enabled: false
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: null, // No subtitle in Prabhabkari
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR',
                interestRate: 'Interest Rate',
                taxRate: 'Tax Rate'
            },
            fields: {
                showInterestRate: true,
                showTaxRate: true,
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false, // Simple table layout
                signaturePosition: 'left' // LEFT aligned signature
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below.',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement',

            accountInfo: {
                boxed: true, // Has bordered box
                layout: 'prabhabkari' // Special layout for this template
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Particulars', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                borders: 'none' // No borders on transaction rows
            },

            summary: {
                format: 'stacked', // Left-aligned stacked format
                layout: 'left',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Last Balance'
                }
            },

            signature: {
                position: 'left', // LEFT aligned
                showName: true,
                showTitle: true,
                name: 'Binod Adhikari',
                title: 'Manager'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Bhuvan K C',
                'Cash Deposit by Numa Lama',
                'Cash Deposit by Soni Rai'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== SIDDHA PALUWA TEMPLATE ==========
    siddhapaluwa: {
        id: 'siddhapaluwa',
        name: 'Siddha Paluwa Sahakari Sastha Limited',
        nameNepali: 'सिद्ध पालुवा कृषि सहकारी संस्था लिमिटेड',
        location: 'Rolpa-8, Nayabazar',
        locationNepali: null,
        established: 'स्था: २०७२',

        // Contact Information
        contact: {
            phone: '086-586005',
            email: 'siddhapaluwa8@gmail.com',
            registration: 'दर्ता नं. १२/०७१/०७२'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#6B21A8', // Purple
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-left'
            },
            footer: {
                enabled: true,
                backgroundColor: '#6B21A8',
                textColor: '#FFFFFF',
                layout: 'full', // Location, Email, Phone
                showPageNumbers: true,
                pageFormat: 'x-of-y'
            },
            colors: {
                primary: '#6B21A8', // Purple
                text: '#000000',
                titleColor: '#000000',
                border: '#000000'
            },
            watermark: {
                enabled: false
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: null, // No subtitle
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountOpeningDate: 'A/C Opening Date',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: false,
                showTaxRate: false,
                showAccountOpening: true // This template shows A/C Opening Date
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'right'
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below:',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement',

            accountInfo: {
                boxed: false,
                layout: 'inline' // Simple inline text like Devipur
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                borders: 'none'
            },

            summary: {
                format: 'centered', // Centered table format
                layout: 'center',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance'
                }
            },

            signature: {
                position: 'right',
                showName: true,
                showTitle: true,
                name: 'Himal Khadka',
                title: 'Manager'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Toplal Thapa',
                'Cash Deposit by Suman Pandey',
                'Cash Deposit by Pabitra Pandey'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== DURWASHA TEMPLATE ==========
    durwasha: {
        id: 'durwasha',
        name: 'Durwasha Bachat Tatha Rin Sahakari Sanstha Li.',
        nameNepali: 'दुर्वाशा बचत तथा ऋण सहकारी संस्था लि.',
        location: 'Butwal, Rupandehi',
        locationNepali: 'बुटवल, रुपन्देही',
        established: 'स्था: २०६७',

        // Contact Information
        contact: {
            phone: '071-542057',
            email: 'durwashacoop1@gmail.com',
            registration: 'दर्ता नं. ६६० (२६६८) ०६७/०६८'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#22C55E', // Green
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-right'
            },
            footer: {
                enabled: true,
                backgroundColor: '#22C55E',
                textColor: '#FFFFFF',
                layout: 'email-phone', // Email on left, Phone on right
                showPageNumbers: true,
                pageFormat: 'simple' // Just page number
            },
            colors: {
                primary: '#22C55E', // Green
                text: '#000000',
                titleColor: '#000000',
                border: '#000000'
            },
            watermark: {
                enabled: false
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: null, // No subtitle
            titleUnderline: false, // NO underline on title
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: false, // NO Interest Rate in certificate
                showTaxRate: false, // NO Tax Rate in certificate
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false,
                nameAddressInIntro: true, // Name and address in intro paragraph
                signaturePosition: 'left' // LEFT aligned signature
            },
            text: {
                intro: 'This is to certify that',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement of Account',
            titleUnderline: false, // NO underline

            accountInfo: {
                boxed: false,
                layout: 'durwasha' // Custom layout for Durwasha
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                headerUnderline: false, // NO underline on table header
                borders: 'none'
            },

            summary: {
                format: 'centered',
                layout: 'center',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance'
                }
            },

            signature: {
                position: 'left', // LEFT aligned
                showName: true,
                showTitle: true,
                name: 'Hari Prasad Khatri',
                title: 'Authorized Signature' // Not Manager
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Bhuvan K C',
                'Cash Deposit by Numa Lama'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== AGNIJWALA TEMPLATE ==========
    agnijwala: {
        id: 'agnijwala',
        name: 'Agnijwala Saving & Credit Co-operative Ltd.',
        nameNepali: 'अग्निज्वाला बचत तथा ऋण सहकारी संस्था लि.',
        location: 'Kalanki-14, Kathmandu, Nepal',
        locationNepali: null,
        established: null,

        // Contact Information
        contact: {
            phone: '+977-98513-17565',
            email: null,
            registration: 'दर्ता नं: १९३१/०६५/६६'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#1E40AF', // Blue
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-right'
            },
            footer: {
                enabled: true,
                backgroundColor: '#1E40AF',
                textColor: '#FFFFFF',
                layout: 'location-phone-registration',
                showPageNumbers: true,
                pageFormat: 'simple'
            },
            colors: {
                primary: '#1E40AF', // Blue
                text: '#000000',
                titleColor: '#000000',
                border: '#000000'
            },
            watermark: {
                enabled: true // Has large circular logo watermark
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: 'To Whom It May Concern', // HAS subtitle
            titleUnderline: true, // UNDERLINED
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: false,
                showTaxRate: false,
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'right'
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below:',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement of Account',
            titleUnderline: true, // UNDERLINED

            accountInfo: {
                boxed: false,
                layout: 'agnijwala' // Custom inline layout
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                headerUnderline: true, // HAS underline
                borders: 'header-only'
            },

            summary: {
                format: 'stacked-with-opening', // Stacked with Opening Balance
                layout: 'left',
                fields: ['debit', 'credit', 'currentBalance', 'openingBalance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    currentBalance: 'Current Balance',
                    openingBalance: 'Opening Balance'
                }
            },

            signature: {
                position: 'right', // RIGHT aligned
                showName: false, // No name shown
                showTitle: true,
                name: null,
                title: 'Authorized Signature'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Suman Thapa',
                'Cash Deposit by Kalpana Rai'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deduction'
        }
    },

    // ========== DHAULAGIRI TEMPLATE ==========
    dhaulagiri: {
        id: 'dhaulagiri',
        name: 'Dhaulagiri Multipurpose Co-operative Society Ltd.',
        nameNepali: 'धौलागिरी बहुउद्देश्यीय सहकारी संस्था लि.',
        location: 'Butwal-08, Rupandehi',
        locationNepali: 'बुटवल -०८, रुपन्देही',
        established: 'स्था. २०५७',

        // Contact Information
        contact: {
            phone: '071-537949',
            email: null,
            registration: 'Regd. No.: 102/056/057'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#16A34A', // Green
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-left'
            },
            footer: {
                enabled: false, // No colored footer bar
                backgroundColor: null,
                textColor: null,
                layout: 'page-only',
                showPageNumbers: true,
                pageFormat: 'bracketed' // [1], [2]
            },
            colors: {
                primary: '#16A34A', // Green
                text: '#000000',
                titleColor: '#000000',
                border: '#000000'
            },
            watermark: {
                enabled: true
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: null, // NO subtitle
            titleUnderline: false, // NO underline
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                interestRate: 'Interest Rate',
                taxRate: 'Tax Rate',
                accountOpening: 'Account Opening',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: true, // SHOWS Interest Rate
                showTaxRate: true, // SHOWS Tax Rate
                showAccountOpening: true // SHOWS Account Opening date
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'left' // LEFT aligned
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below.',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement',
            titleUnderline: false, // NO underline

            accountInfo: {
                boxed: false,
                layout: 'dhaulagiri' // Custom layout
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                headerUnderline: false,
                borders: 'none'
            },

            summary: {
                format: 'inline', // Summary as last row in transaction table
                layout: 'inline',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    title: 'Statement Summary'
                }
            },

            signature: {
                position: 'left', // LEFT aligned
                showName: true,
                showTitle: true,
                name: 'Sapana Khanal',
                title: 'Manager'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Nima Rai',
                'Cash Deposit by Hari Pandey',
                'Cash Deposit by Rajan Thapa'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== AARATI TEMPLATE ==========
    aarati: {
        id: 'aarati',
        name: 'Aarati Multipurpose Co-operative Ltd.',
        nameNepali: 'आरती बहुउद्देश्यीय सहकारी संस्था लि.',
        location: 'Butwal-11, Rupandehi',
        locationNepali: 'बुटवल-११, रुपन्देही',
        established: 'स्था: २०७१',
        slogan: 'भविष्यको साथी हाम्रो सहकारी',

        // Contact Information
        contact: {
            phone: '071-410566',
            email: 'aaraticoop@gmail.com',
            registration: 'दर्ता नं. ८२६ (३९६१) ०७०/०७१'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#16A34A', // Green
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-left'
            },
            footer: {
                enabled: true,
                backgroundColor: '#16A34A',
                textColor: '#FFFFFF',
                layout: 'multi-location', // Multiple contact locations
                showPageNumbers: true,
                pageFormat: 'simple'
            },
            colors: {
                primary: '#16A34A', // Green
                text: '#000000',
                titleColor: '#000000',
                border: '#000000'
            },
            watermark: {
                enabled: true
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: 'To Whom It May Concern', // HAS subtitle
            titleUnderline: true, // UNDERLINED
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                interestRate: 'Interest Rate',
                taxRate: 'Tax Rate',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: true,
                showTaxRate: true,
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'right'
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below.',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement',
            titleUnderline: false, // NO underline on statement title

            accountInfo: {
                boxed: false,
                layout: 'aarati' // Custom inline layout
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                headerUnderline: false, // NO underline
                borders: 'none'
            },

            summary: {
                format: 'centered', // Default centered table format
                layout: 'center',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance'
                }
            },

            signature: {
                position: 'right', // RIGHT aligned
                showName: true,
                showTitle: true,
                name: 'Shiva Kumar Lamsal',
                title: 'Manager'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Rina Sunar',
                'Cash Deposit by Suman Pandey',
                'Cash Deposit by Bandana Kafle',
                'Cash Deposit by Mina Kafle',
                'Cash Deposit by Nima Bhusal',
                'Cash Deposit by Shila Thapa'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    },

    // ========== AAROGYA TEMPLATE ==========
    aarogya: {
        id: 'aarogya',
        name: 'Aarogya Saving & Credit Co-operative Ltd.',
        nameNepali: 'आरोग्य बचत तथा ऋण सहकारी संस्था लि.',
        location: 'Kathmandu',
        locationNepali: 'काठमाडौं',
        established: null,
        slogan: 'सबका तपाईको, बचत तपाईको भविष्य पति तपाई की, अव्को सानू - आरोग्यसंग',

        // Contact Information
        contact: {
            phone: '01-8004999',
            email: 'aarogyasaving@gmail.com',
            website: 'www.aarogyasaccos.com.np',
            registration: 'दर्ता नं. ३४६०/०६०/०६८'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#DC2626', // Red
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-right'
            },
            footer: {
                enabled: true,
                backgroundColor: '#16A34A', // Green footer
                textColor: '#FFFFFF',
                layout: 'website-email',
                showPageNumbers: true,
                pageFormat: 'simple'
            },
            colors: {
                primary: '#DC2626', // Red
                text: '#000000',
                titleColor: '#DC2626', // Red titles
                border: '#000000'
            },
            watermark: {
                enabled: true
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: 'To Whom It May Concern',
            titleUnderline: false, // NO underline
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: false, // NO Interest Rate
                showTaxRate: false, // NO Tax Rate
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'right'
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below:',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.',
                exchangeRateNote: 'For information @ 1 USD = NPR' // Different format
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement of Account',
            titleUnderline: false, // NO underline

            accountInfo: {
                boxed: false,
                layout: 'aarogya' // Custom layout
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Particulars', align: 'left', width: '40%' }, // Particulars, not Description
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                headerUnderline: false,
                borders: 'none'
            },

            summary: {
                format: 'centered', // Default centered table format
                layout: 'center',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance'
                }
            },

            signature: {
                position: 'right', // RIGHT aligned
                showName: true,
                showTitle: true,
                titleFirst: true, // Title comes BEFORE name
                name: 'Yogendra Darshandhari',
                title: 'Manager'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Dep. By Self',
                'Cash Dep. By Aruna',
                'Cash Dep. By Dipak',
                'Cash Dep. By Nirmala',
                'Cash Dep. By Kushal',
                'Cash Dep. By Prabin',
                'Cash Dep. By Lokendra',
                'Cash Dep. By Muskan',
                'Cash Dep. By Sajan',
                'Cash Dep. By Binod',
                'Cash Dep. By Lokesh',
                'Cash Dep. By Rabindra',
                'Cash Dep. By Dikshya'
            ],
            withdrawals: [
                'Cheque Withdrawal By Self',
                'Cash Withdrawal By Self'
            ],
            interest: 'Interest',
            tax: 'Tax Deduction'
        }
    },

    // ========== NILRATNA TEMPLATE ==========
    nilratna: {
        id: 'nilratna',
        name: 'Nilratna Saving & Credit Co-operative Ltd.',
        nameNepali: 'नीलरत्न बचत तथा ऋण सहकारी संस्था लि.',
        location: 'Asan, Nyeud, Kathmandu',
        locationNepali: 'असन, न्यौड, काठमाडौं',
        established: null,

        // Contact Information
        contact: {
            phone: '01-4229784, 4229785',
            email: 'cooperative26@gmail.com',
            facebook: 'www.facebook.com/nilratna 123',
            registration: 'दर्ता नं. २२६२/०६६/०६७'
        },

        // Visual Design
        design: {
            header: {
                enabled: true,
                backgroundColor: '#DC2626', // Red
                textColor: '#FFFFFF',
                showRegistration: true,
                registrationPosition: 'top-right'
            },
            footer: {
                enabled: true,
                backgroundColor: '#2563EB', // Blue footer
                textColor: '#FFFFFF',
                layout: 'email-facebook',
                showPageNumbers: true,
                pageFormat: 'x-of-y' // Page 1 of 2
            },
            colors: {
                primary: '#DC2626', // Red
                text: '#000000',
                titleColor: '#DC2626', // Red titles
                border: '#000000'
            },
            watermark: {
                enabled: true
            }
        },

        // Certificate Configuration
        certificate: {
            title: 'Balance Certificate',
            subtitle: 'To Whom It May Concern',
            titleUnderline: true, // UNDERLINED
            labels: {
                accountHolder: 'Name of Account Holder',
                address: 'Address of Account Holder',
                accountNo: 'A/C No.',
                accountType: 'Account Type',
                currency: 'Currency',
                balance: 'Balance of NPR'
            },
            fields: {
                showInterestRate: false, // NO Interest Rate
                showTaxRate: false, // NO Tax Rate
                showAccountOpening: false
            },
            layout: {
                detailsBoxed: false,
                signaturePosition: 'right'
            },
            text: {
                intro: 'This is to certify that the balance in the credit of the Account Holder is mentioned below:',
                disclaimer: 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'
            }
        },

        // Statement Configuration
        statement: {
            title: 'Statement of Account',
            titleUnderline: false, // NO underline

            accountInfo: {
                boxed: true, // BOXED
                layout: 'nilratna' // Custom boxed layout
            },

            table: {
                columns: [
                    { key: 'date', label: 'Date', align: 'left', width: '12%' },
                    { key: 'description', label: 'Description', align: 'left', width: '40%' },
                    { key: 'debit', label: 'Debit', align: 'right', width: '16%' },
                    { key: 'credit', label: 'Credit', align: 'right', width: '16%' },
                    { key: 'balance', label: 'Balance', align: 'right', width: '16%' }
                ],
                headerUnderline: false,
                borders: 'none'
            },

            summary: {
                format: 'centered', // Default centered table format
                layout: 'center',
                fields: ['debit', 'credit', 'balance'],
                labels: {
                    debit: 'Debit Amount',
                    credit: 'Credit Amount',
                    balance: 'Current Balance'
                }
            },

            signature: {
                position: 'right', // RIGHT aligned
                showName: true,
                showTitle: true,
                name: 'Bishnu B C',
                title: 'Authorized Signature'
            }
        },

        // Transaction descriptions
        transactionDescriptions: {
            deposits: [
                'Cash Deposit by Self',
                'Cash Deposit by Bhuvan K C',
                'Cash Deposit by Numa Lama',
                'Cash Deposit by Soni Rai'
            ],
            withdrawals: [
                'CHEQUE Withdrawal by Self',
                'CASH Withdrawal'
            ],
            interest: 'Interest Posted on A/C',
            tax: 'Tax Deducted'
        }
    }
};

// Helper to get template by ID
export const getTemplate = (templateId) => {
    return BANK_TEMPLATES[templateId] || BANK_TEMPLATES.sarbeshwor;
};

// Get list of all available templates for dropdown
export const getTemplateList = () => {
    return Object.values(BANK_TEMPLATES).map(template => ({
        value: template.id,
        label: template.name
    }));
};
