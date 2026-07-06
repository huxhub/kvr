-- KVR Tata Tracker - MySQL Database Schema
-- Run this file on a fresh MySQL database to create all required tables.
-- Usage: mysql -u root -p kvr < database/schema.sql

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  username    VARCHAR(50)  NOT NULL PRIMARY KEY,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL,
  name        VARCHAR(100) NOT NULL,
  branch      VARCHAR(100) NOT NULL DEFAULT 'Perinthalmanna',
  email       VARCHAR(100) DEFAULT '',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  chassisNumber       VARCHAR(100) NOT NULL PRIMARY KEY,

  -- Customer Details
  date                VARCHAR(30)  DEFAULT '',
  customerName        VARCHAR(150) NOT NULL,
  mobileNumber        VARCHAR(20)  DEFAULT '',
  optyId              VARCHAR(50)  DEFAULT '',
  orderNumber         VARCHAR(50)  DEFAULT '',
  sapOrderNo          VARCHAR(50)  DEFAULT '',
  invoiceNumber       VARCHAR(50)  DEFAULT '',
  source              VARCHAR(50)  DEFAULT '',
  year                INT          DEFAULT NULL,

  -- Vehicle Details
  vehicleStatus       VARCHAR(50)  DEFAULT '',
  fuel                VARCHAR(20)  DEFAULT '',
  pl                  VARCHAR(50)  DEFAULT '',
  variant             VARCHAR(80)  DEFAULT '',
  colour              VARCHAR(50)  DEFAULT '',
  bdStatus            VARCHAR(50)  DEFAULT '',
  bdDate              VARCHAR(30)  DEFAULT '',
  vc                  VARCHAR(50)  DEFAULT '',

  -- Sales Details
  ca                  VARCHAR(80)  DEFAULT '',
  tl                  VARCHAR(80)  DEFAULT '',
  branch              VARCHAR(80)  NOT NULL DEFAULT 'Perinthalmanna',
  region              VARCHAR(50)  DEFAULT '',
  crmBookingStatus    VARCHAR(100) DEFAULT '',
  branchStatus        VARCHAR(50)  DEFAULT '',
  branchRemark        VARCHAR(255) DEFAULT '',

  -- Offer Details
  hypothecation       VARCHAR(80)  DEFAULT '',
  cashDiscount        INT          DEFAULT 0,
  exchangeLoyalty     INT          DEFAULT 0,
  corporate           INT          DEFAULT 0,
  sss                 INT          DEFAULT 0,
  kpkb                INT          DEFAULT 0,
  solarOffer          INT          DEFAULT 0,
  priceDifference     INT          DEFAULT 0,
  offerRemark         TEXT,

  -- Finance Details
  financeType         VARCHAR(50)  DEFAULT '',
  onRoadPrice         INT          DEFAULT 0,
  ip                  INT          DEFAULT 0,
  loanAmount          INT          DEFAULT 0,
  balanceAmount       INT          DEFAULT 0,
  fundPercentage      DECIMAL(5,2) DEFAULT 0,
  loanAmountStatus    VARCHAR(30)  DEFAULT '',
  financeRemark       TEXT,
  financeStatus       VARCHAR(30)  DEFAULT 'Not Attended',
  financeTimestamp     VARCHAR(30)  DEFAULT '',

  -- TMA Details
  exchangeYesNo       VARCHAR(10)  DEFAULT '',
  tmaType             VARCHAR(50)  DEFAULT '',
  makeAndModel        VARCHAR(80)  DEFAULT '',
  regNumber           VARCHAR(30)  DEFAULT '',
  tmaRemark           TEXT,
  tmaStatus           VARCHAR(30)  DEFAULT 'Not Attended',
  tmaTimestamp        VARCHAR(30)  DEFAULT '',

  -- File Details
  fileStatus          VARCHAR(30)  DEFAULT 'Not Attended',
  fileTimestamp       VARCHAR(30)  DEFAULT '',

  -- Accounts Details
  tallyDate           VARCHAR(30)  DEFAULT '',
  accountsRemark      TEXT,
  accountsStatus      VARCHAR(30)  DEFAULT 'Not Attended',
  accountsTimestamp   VARCHAR(30)  DEFAULT '',

  -- Insurance Details
  insuranceName       VARCHAR(80)  DEFAULT '',
  insuranceType       VARCHAR(50)  DEFAULT '',
  insurancePremium    INT          DEFAULT 0,
  insuranceRemark     TEXT,
  insuranceStatus     VARCHAR(30)  DEFAULT 'Not Attended',
  insuranceTimestamp  VARCHAR(30)  DEFAULT '',

  -- Registration Details
  registrationType    VARCHAR(30)  DEFAULT '',
  applicationNumber   VARCHAR(50)  DEFAULT '',
  taxPaidDate         VARCHAR(30)  DEFAULT '',
  registerNumber      VARCHAR(30)  DEFAULT '',
  hsrpStatus          VARCHAR(30)  DEFAULT '',
  registrationRemark  TEXT,
  registrationStatus  VARCHAR(30)  DEFAULT 'Not Attended',
  registrationTimestamp VARCHAR(30) DEFAULT '',

  -- TMGA Details
  tmgaValue           INT          DEFAULT 0,
  vasValue            INT          DEFAULT 0,
  tmgaRemark          TEXT,
  tmgaStatus          VARCHAR(30)  DEFAULT 'Not Attended',
  tmgaTimestamp       VARCHAR(30)  DEFAULT '',

  -- PDI Details
  pdiRemark           TEXT,
  pdiStatus           VARCHAR(30)  DEFAULT 'Not Attended',
  pdiTimestamp        VARCHAR(30)  DEFAULT '',

  -- Delivery Details
  cxoRemark           TEXT,
  expectedDeliveryDate VARCHAR(30) DEFAULT '',
  actualDeliveryDate  VARCHAR(30)  DEFAULT '',
  homeVisit14DayStatus VARCHAR(30) DEFAULT '',
  deliveryStatus      VARCHAR(30)  DEFAULT 'Not Attended',
  deliveryTimestamp   VARCHAR(30)  DEFAULT '',

  -- Timestamps
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  chassisNumber   VARCHAR(100) NOT NULL,
  customerName    VARCHAR(255) DEFAULT '',
  updatedBy       VARCHAR(100) DEFAULT '',
  department      VARCHAR(100) DEFAULT '',
  previousStatus  VARCHAR(50)  DEFAULT '',
  newStatus       VARCHAR(50)  DEFAULT '',
  remarks         TEXT,
  timestamp       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_audit_chassis (chassisNumber),
  INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  setting_key     VARCHAR(50)  NOT NULL PRIMARY KEY,
  companyName     VARCHAR(255) NOT NULL DEFAULT 'KVR TATA',
  companyPhone    VARCHAR(50)  DEFAULT '+91 98470 12345',
  companyEmail    VARCHAR(100) DEFAULT 'support@kvrgroup.com',
  companyAddress  VARCHAR(500) DEFAULT 'KVR Group, NH 66, Perinthalmanna, Kerala',
  branches        JSON         DEFAULT NULL,
  theme           VARCHAR(20)  DEFAULT 'light',
  enableAlerts    TINYINT(1)   DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
