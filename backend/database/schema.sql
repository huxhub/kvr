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
  branch      VARCHAR(100) NOT NULL DEFAULT '',
  email       VARCHAR(100) DEFAULT '',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  chassisNumber       VARCHAR(50) NOT NULL PRIMARY KEY,
  crmGenerated        TINYINT      NOT NULL DEFAULT 0,

  -- Customer Details
  date                VARCHAR(30)  DEFAULT '',
  customerName        VARCHAR(100) NOT NULL,
  mobileNumber        VARCHAR(20)  DEFAULT '',
  optyId              VARCHAR(30)  DEFAULT '',
  orderNumber         VARCHAR(30)  DEFAULT '',
  sapOrderNo          VARCHAR(30)  DEFAULT '',
  invoiceNumber       VARCHAR(30)  DEFAULT '',
  source              VARCHAR(30)  DEFAULT '',
  year                INT          DEFAULT NULL,

  -- Vehicle Details
  vehicleStatus       VARCHAR(30)  DEFAULT '',
  fuel                VARCHAR(20)  DEFAULT '',
  pl                  VARCHAR(50)  DEFAULT '',
  variant             VARCHAR(80)  DEFAULT '',
  colour              VARCHAR(50)  DEFAULT '',
  boStatus            TEXT,
  boDate              TEXT,
  vc                  VARCHAR(50)  DEFAULT '',

  -- Sales Details
  ca                  VARCHAR(80)  DEFAULT '',
  tl                  VARCHAR(80)  DEFAULT '',
  branch              VARCHAR(80)  NOT NULL DEFAULT '',
  region              TEXT,
  crmBookingStatus    TEXT,
  branchStatus        TEXT,
  branchRemark        TEXT,

  -- Offer Details
  hypothecation       VARCHAR(50)  DEFAULT '',
  cashDiscount        INT          DEFAULT 0,
  exchangeLoyalty     INT          DEFAULT 0,
  corporate           INT          DEFAULT 0,
  sss                 INT          DEFAULT 0,
  kpkb                INT          DEFAULT 0,
  solarOffer          INT          DEFAULT 0,
  priceDifference     INT          DEFAULT 0,
  offerRemark         TEXT,

  -- Finance Details
  financeType         VARCHAR(30)  DEFAULT '',
  onRoadPrice         INT          DEFAULT 0,
  ip                  INT          DEFAULT 0,
  loanAmount          INT          DEFAULT 0,
  balanceAmount       INT          DEFAULT 0,
  fundPercentage      DECIMAL(5,2) DEFAULT 0,
  loanAmountStatus    VARCHAR(25)  DEFAULT '',
  financeRemark       TEXT,
  financeStatus       VARCHAR(25)  DEFAULT 'Not Attended',
  financeTimestamp     VARCHAR(25)  DEFAULT '',

  -- TMA Details
  exchangeYesNo       VARCHAR(10)  DEFAULT '',
  tmaType             VARCHAR(30)  DEFAULT '',
  makeAndModel        VARCHAR(50)  DEFAULT '',
  regNumber           VARCHAR(25)  DEFAULT '',
  tmaRemark           TEXT,
  tmaStatus           VARCHAR(25)  DEFAULT 'Not Attended',
  tmaTimestamp        VARCHAR(25)  DEFAULT '',

  -- File Details
  fileStatus          VARCHAR(25)  DEFAULT 'Not Attended',
  fileTimestamp       VARCHAR(25)  DEFAULT '',

  -- Accounts Details
  tallyDate           VARCHAR(25)  DEFAULT '',
  accountsRemark      TEXT,
  accountsStatus      VARCHAR(25)  DEFAULT 'Not Attended',
  accountsTimestamp   VARCHAR(25)  DEFAULT '',

  -- Insurance Details
  insuranceName       VARCHAR(50)  DEFAULT '',
  insuranceType       VARCHAR(30)  DEFAULT '',
  insurancePremium    INT          DEFAULT 0,
  insuranceRemark     TEXT,
  insuranceStatus     VARCHAR(25)  DEFAULT 'Not Attended',
  insuranceTimestamp  VARCHAR(25)  DEFAULT '',

  -- Registration Details
  registrationType    VARCHAR(25)  DEFAULT '',
  applicationNumber   VARCHAR(35)  DEFAULT '',
  taxPaidDate         VARCHAR(25)  DEFAULT '',
  registerNumber      VARCHAR(25)  DEFAULT '',
  hsrpStatus          VARCHAR(25)  DEFAULT '',
  registrationRemark  TEXT,
  registrationStatus  VARCHAR(25)  DEFAULT 'Not Attended',
  registrationTimestamp VARCHAR(25) DEFAULT '',

  -- TMGA Details
  tmgaValue           INT          DEFAULT 0,
  vasValue            INT          DEFAULT 0,
  tmgaRemark          TEXT,
  tmgaStatus          VARCHAR(25)  DEFAULT 'Not Attended',
  tmgaTimestamp       VARCHAR(25)  DEFAULT '',

  -- PDI Details
  pdiRemark           TEXT,
  pdiStatus           VARCHAR(25)  DEFAULT 'Not Attended',
  pdiTimestamp        VARCHAR(25)  DEFAULT '',

  -- Delivery Details
  cxoRemark           TEXT,
  expectedDeliveryDate VARCHAR(25) DEFAULT '',
  actualDeliveryDate  VARCHAR(25)  DEFAULT '',
  homeVisit14DayStatus VARCHAR(25) DEFAULT '',
  deliveryStatus      VARCHAR(25)  DEFAULT 'Not Attended',
  deliveryTimestamp   VARCHAR(25)  DEFAULT '',

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
  previousStatus  TEXT,
  newStatus       TEXT,
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
  companyPhone    VARCHAR(50)  DEFAULT '',
  companyEmail    VARCHAR(100) DEFAULT '',
  companyAddress  VARCHAR(500) DEFAULT '',
  branches        JSON         DEFAULT NULL,
  theme           VARCHAR(20)  DEFAULT 'light',
  enableAlerts    TINYINT(1)   DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
