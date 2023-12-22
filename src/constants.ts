// NMEA
export const START_FLAG = '$'
export const SEPARATOR = ','
export const DELIMITER = '*'
export const END_FLAG = '\r\n'

export const START_FLAG_LENGTH = START_FLAG.length
export const SEPARATOR_LENGTH = SEPARATOR.length
export const DELIMITER_LENGTH = DELIMITER.length
export const CHECKSUM_LENGTH = 2
export const END_FLAG_LENGTH = END_FLAG.length
export const MINIMAL_LENGTH = START_FLAG_LENGTH + DELIMITER_LENGTH + CHECKSUM_LENGTH + END_FLAG_LENGTH

export const NMEA_ID_LENGTH = 3
export const NMEA_TALKER_LENGTH = 2
export const NMEA_SENTENCE_LENGTH = NMEA_ID_LENGTH + NMEA_TALKER_LENGTH

export const TALKERS = new Map<string, string>
TALKERS.set('AB', 'Independent AIS Base Station')
TALKERS.set('AD', 'Dependent AIS Base Station')
TALKERS.set('AG', 'Autopilot - General')
TALKERS.set('AI', 'Mobile AIS Station')
TALKERS.set('AN', 'AIS Aid to Navigation')
TALKERS.set('AP', 'Autopilot - Magnetic')
TALKERS.set('AR', 'AIS Receiving Station')
TALKERS.set('AT', 'AIS Transmitting Station')
TALKERS.set('AX', 'AIS Simplex Repeater')
TALKERS.set('BD', 'BeiDou (China)')
TALKERS.set('BI', 'Bilge System')
TALKERS.set('BN', 'Bridge navigational watch alarm system')
TALKERS.set('CA', 'Central Alarm')
TALKERS.set('CC', 'Computer - Programmed Calculator (obsolete)')
TALKERS.set('CD', 'Communications - Digital Selective Calling (DSC)')
TALKERS.set('CM', 'Computer - Memory Data (obsolete)')
TALKERS.set('CR', 'Data Receiver')
TALKERS.set('CS', 'Communications - Satellite')
TALKERS.set('CT', 'Communications - Radio-Telephone (MF/HF)')
TALKERS.set('CV', 'Communications - Radio-Telephone (VHF)')
TALKERS.set('CX', 'Communications - Scanning Receiver')
TALKERS.set('DE', 'DECCA Navigation (obsolete)')
TALKERS.set('DF', 'Direction Finder')
TALKERS.set('DM', 'Velocity Sensor, Speed Log, Water, Magnetic')
TALKERS.set('DP', 'Dynamiv Position')
TALKERS.set('DU', 'Duplex repeater station')
TALKERS.set('EC', 'Electronic Chart Display & Information System (ECDIS)')
TALKERS.set('EP', 'Emergency Position Indicating Beacon (EPIRB)')
TALKERS.set('ER', 'Engine Room Monitoring Systems')
TALKERS.set('FD', 'Fire Door')
TALKERS.set('FS', 'Fire Sprinkler')
TALKERS.set('GA', 'Galileo Positioning System')
TALKERS.set('GB', 'BeiDou (China)')
TALKERS.set('GI', 'NavIC, IRNSS (India)')
TALKERS.set('GL', 'GLONASS, according to IEIC 61162-1')
TALKERS.set('GN', 'Combination of multiple satellite systems (NMEA 1083)')
TALKERS.set('GP', 'Global Positioning System receiver')
TALKERS.set('GQ', 'QZSS regional GPS augmentation system (Japan)')
TALKERS.set('HC', 'Heading - Magnetic Compass')
TALKERS.set('HD', 'Hull Door')
TALKERS.set('HE', 'Heading - North Seeking Gyro')
TALKERS.set('HF', 'Heading - Fluxgate')
TALKERS.set('HN', 'Heading - Non North Seeking Gyro')
TALKERS.set('HS', 'Hull Stress')
TALKERS.set('II', 'Integrated Instrumentation')
TALKERS.set('IN', 'Integrated Navigation')
TALKERS.set('JA', 'Alarm and Monitoring')
TALKERS.set('JB', 'Water Monitoring')
TALKERS.set('JC', 'Power Management')
TALKERS.set('JD', 'Propulsion Control')
TALKERS.set('JE', 'Engine Control')
TALKERS.set('JF', 'Propulsion Boiler')
TALKERS.set('JG', 'Aux Boiler')
TALKERS.set('JH', 'Engine Governor')
TALKERS.set('LA', 'Loran A (obsolete)')
TALKERS.set('LC', 'Loran C (obsolete)')
TALKERS.set('MP', 'Microwave Positioning System (obsolete)')
TALKERS.set('MX', 'Multiplexer')
TALKERS.set('NL', 'Navigation light controller')
TALKERS.set('OM', 'OMEGA Navigation System (obsolete)')
TALKERS.set('OS', 'Distress Alarm System (obsolete)')
TALKERS.set('QZ', 'QZSS regional GPS augmentation system (Japan)')
TALKERS.set('RA', 'RADAR and/or ARPA')
TALKERS.set('RB', 'Record Book')
TALKERS.set('RC', 'Propulsion Machinery')
TALKERS.set('RI', 'Rudder Angle Indicator')
TALKERS.set('SA', 'Physical Shore AUS Station')
TALKERS.set('SD', 'Depth Sounder')
TALKERS.set('SG', 'Steering Gear')
TALKERS.set('SN', 'Electronic Positioning System, other/general')
TALKERS.set('SS', 'Scanning Sounder')
TALKERS.set('ST', 'Skytraq debug output')
TALKERS.set('TC', 'Track Control')
TALKERS.set('TI', 'Turn Rate Indicator')
TALKERS.set('TR', 'TRANSIT Navigation System')
TALKERS.set('UP', 'Microprocessor controller')
TALKERS.set('VA', 'VHF Data Exchange System (VDES), ASM')
TALKERS.set('VD', 'Velocity Sensor, Doppler, other/general')
TALKERS.set('VM', 'Velocity Sensor, Speed Log, Water, Magnetic')
TALKERS.set('VR', 'Voyage Data recorder')
TALKERS.set('VS', 'VHF Data Exchange System (VDES), Satellite')
TALKERS.set('VT', 'VHF Data Exchange System (VDES), Terrestrial')
TALKERS.set('VW', 'Velocity Sensor, Speed Log, Water, Mechanical')
TALKERS.set('WD', 'Watertight Door')
TALKERS.set('WI', 'Weather Instruments')
TALKERS.set('WL', 'Water Level')
TALKERS.set('YC', 'Transducer - Temperature (obsolete)')
TALKERS.set('YD', 'Transducer - Displacement, Angular or Linear (obsolete)')
TALKERS.set('YF', 'Transducer - Frequency (obsolete)')
TALKERS.set('YL', 'Transducer - Level (obsolete)')
TALKERS.set('YP', 'Transducer - Pressure (obsolete)')
TALKERS.set('YR', 'Transducer - Flow Rate (obsolete)')
TALKERS.set('YT', 'Transducer - Tachometer (obsolete)')
TALKERS.set('YV', 'Transducer - Volume (obsolete)')
TALKERS.set('YX', 'Transducer')
TALKERS.set('ZA', 'Timekeeper - Atomic Clock')
TALKERS.set('ZC', 'Timekeeper - Chronometer')
TALKERS.set('ZQ', 'Timekeeper - Quartz')
TALKERS.set('ZV', 'Timekeeper - Radio Update, WWV or WWVH')

export const TALKERS_SPECIAL = {
  'P': 'Vendor specific',
  'U': 'U# where \'#\' is a digit 0 …​ 9; User Configured',
}


// GENERATE ASCII STRING
export const CODE_A = 'A'.charCodeAt(0)
export const CODE_Z = 'Z'.charCodeAt(0)
export const CODE_a = 'a'.charCodeAt(0)
export const CODE_z = 'z'.charCodeAt(0)
export const CODE_0 = '0'.charCodeAt(0)
export const CODE_9 = '9'.charCodeAt(0)

// GENERATE NUMBERS
export const UINT8_MAX = Uint8Array.from([0b1111_1111])[0]
export const UINT16_MAX = Uint16Array.from([0b1111_1111_1111_1111])[0]
export const UINT32_MAX = Uint32Array.from([0b1111_1111_1111_1111_1111_1111_1111_1111])[0]
// export const UINT64_MAX = Uint64Array.from([0b11111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111])[0]

export const [INT8_MIN, INT8_MAX] = Int8Array.from([0b1000_0000, 0b0111_1111])
export const [INT16_MIN, INT16_MAX] = Int16Array.from([0b1000_0000_0000_0000, 0b0111_1111_1111_1111])
export const [INT32_MIN, INT32_MAX] = Int32Array.from([0b1000_0000_0000_0000_0000_0000_0000_0000, 0b0111_1111_1111_1111_1111_1111_1111_1111])
// export const [INT64_MIN, INT64_MAX] = Int64Array.from([0b10000000_00000000_00000000_00000000_00000000_00000000_00000000_00000000, 0b01111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111])

export const MAX_FLOAT = 999999999999999
export const MIN_FLOAT = -999999999999999

// PARSER
export const MAX_CHARACTERS = 1024
export const MAX_NMEA_CHARACTERS = 82
