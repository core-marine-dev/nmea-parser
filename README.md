# NMEA parser

![npm (scoped)](https://img.shields.io/npm/v/%40coremarine/nmea-parser)
[![publish](https://github.com/core-marine-dev/nmea-parser/actions/workflows/publish.yml/badge.svg)](https://github.com/core-marine-dev/nmea-parser/actions/workflows/publish.yml)
![npm](https://img.shields.io/npm/dy/%40coremarine/nmea-parser)

**NMEA Parser** is a library to parse NMEA 0183 sentences.

> [NMEA](https://en.wikipedia.org/wiki/NMEA_0183) 0183, or just NMEA, is an standard ASCII text protocol typically used for GNSS (GPS) devices and naval tools.

This library parse **ALL** NMEA-like sentences (sentences that follow these rules):

- ASCII string
- Start with `$`
- Fields separated by `,`
- An `*` character splitting info and checksum
- Two digits of checksum
- End with `\r\n`

If the parser knows the NMEA sentences it gives more metadata. Known frames are:

<details>
  <summary>NMEA 3.01</summary>

  - AAM
  - GGA
  - HDT
  - ZDA

</details>

> NMEA is a backwards compatible protocol from 4.x versions until 2.00.

## How to use it

```typescript
import { NMEAParser } from '@coremarine/nmea-parser'
// NMEA parser
const parser = new NMEAParser()
```

### Parse NMEA string data

The main behaviour it's just to create a parser object and with its method `parseData()` get the parsed sentences.

```typescript
// NMEA ascii string with multiple sentences
const input = '$GPGGA,...\r\n$GPAAM,...\r\n'
const output: NMEASentence[] = parser.parseData(input)
```

The output it is an array of parsed sentences which have this type

```typescript
type NMEASentence = {
  // Sentence ID
  sentence: string,
  // Array just with the data of each field (easier to just read data and not fields metadata)
  data: Array<string | number | boolean | null>,
  // Array with ordered fields and their metadata
  fields: Array<{
    name: string,
    data: string | number | boolean | null,
    units?: string,
    note?: string,
  }>,
  // Protocol information
  protocol: {
    name: string,
    standard: boolean,
    version: string,
  },
  // UTC timestamp when the sentence was parsed
  timestamp: number,
  // Whole ASCII string sentence
  raw: string,
  // Sentence checksum
  checksum: number
  // Sentence talker
  talker?: null | { id: string, description: string }
}
```

If the sentence is unknown for the parser you have:

- `protocol` is equal to `{ name: 'UNKNOWN' }`
- `data` is an `Array<string>`
- In `fields` each element is equal to `{ name: 'unknown', data: string }`

### Feed the parser

Another feature is to feed or train the parser to know more sentences. You can do it with a user friendly YAML file.

Look the section [Feeding the parser](#feeding-the-parser-adding-known-sentences)

### Extra features: memory and internal buffer

You can enable or disable memory in the parser. Why?

- Imagine you are streaming NMEA data into the parser
- You just enters string in slots so a frame could be splitted into string slots
- With memory the parser remember the last half frame
- So you can finally parse with the next string input

## Feeding the parser (adding known sentences)

One of the greatest features of the parser is you can expand with more NMEA-like sentences. Standard or propietary sentences, it doesn't mind.

If you make smarter your parser, it will give you more metadata of each sentence and all the values will be in their right type.

Feeding the parser is with its method `addProtocols()`. You can use three ways (order by parser priority):

1. YAML file path
    - Is the `ProtocolsInput.file` property
2. YAML file string content
    - Is the `ProtocolsInput.content` property
3. Protocol (JS) object
    - Is the `ProtocolsInput.protocols` property

```typescript
type ProtocolsInput = {
  // YAML file path
  file?: string,
  // YAML file string content
  content?: string,
  // JS object similar
  protcols?: Array<Protocol>
}

let input: ProtocolsInput

...

parser.addProtocols(input)
```

### YAML file / Protocols File

The YAML file is the most friendly way to feed the parser. It has this structure:

```yaml
protocols:
  # Array of protocols
  - protocol: <name>
    version: <semantic version>
    standard: <true or false>
    # Array of sentences
    sentences:
      # Each sentence has this structure
      - sentence: <ID of sentence 1>
        description: <optional description>
        # Array of fields
        fields:
          # Each field has this structure
          - name: <field 1>
            type: <type>
            units: <optional units>
            note: <optional note>
```

It will be parsed into an `Protocol` object then (see next section).

Example of a yaml file

```yaml
protocols:
  # NMEA 3.1
  - protocol: NMEA
    version: '3.1'
    standard: true
    sentences:
      - sentence: AAM
        description: Waypoint Arrival Alarm
        fields:
          # 1
          - name: status
            type: string
            note: "BOOLEAN\n
            
              A = arrival circle entered\n

              V = arrival circle not passed"
          # 2
          - name: status
            type: string
            note: "BOOLEAN\n
            
              A = perpendicular passed at waypoint\n
              
              V = perpendicular not passed"
          # 3
          - name: arrival_circle_radius
            type: float32
          # 4
          - name: radius_units
            type: string
            units: nautic miles
          # 5
          - name: waypoint_id
            type: string
      - sentence: GGA
        description: Global Positioning System Fix Data
        fields:
          # 1
          - name: utc_position
            type: string
            units: ms
          # 2
          - name: latitude
            type: string
            units: deg
          # 3
          - name: latitude_direction
            type: string
            note: "N: North\n
              S: South"
          # 4
          - name: longitude
            type: string
            units: deg
          # 5
          - name: longitude_direction
            type: string
            note: "E - East\n
              W - West"
          # 6
          - name: gps_quality
            type: int8
            note: "0: Fix not valid\n
              1: GPS fix\n
              2: Differential GPS fix (DGNSS), SBAS, OmniSTAR VBS, Beacon, RTX in GVBS mode\n
              3: Not applicable\n
              4: RTK Fixed, xFill\n
              5: RTK Float, OmniSTAR XP/HP, Location RTK, RTX\n
              6: INS Dead reckoning\n
              7: Manual Input Mode\n
              8: Simulator Mode"
          # 7
          - name: satellites
            type: uint8
          # 8
          - name: hdop
            type: float64
          # 9
          - name: altitude
            type: float64
            units: m
            note: "Orthometric height Mean-Sea-Level (MSL reference)"
          # 10
          - name: altitude_units
            type: string
            units: m
          # 11
          - name: geoid_separation
            type: float64
            units: m
            note: "Geoidal Separation: the difference between the WGS-84 earth ellipsoid surface and mean-sea-level (geoid) surface, \"-\" = mean-sea-level surface below WGS-84 ellipsoid surface."
          # 12
          - name: geoid_separation_units
            type: string
            units: m
          # 13
          - name: age_of_differential_gps_data
            type: float64
            units: sec
            note: "Time in seconds since last SC104 Type 1 or 9 update, null field when DGPS is not used300"
          # 14
          - name: reference_station_id
            type: uint16
            note: "Reference station ID, range 0000 to 4095. A null field when any reference station ID is selected and no corrections are received. See table below for a description of the field values.\n

              0002 CenterPoint or ViewPoint RTX\n

              0005 RangePoint RTX\n

              0006 FieldPoint RTX\n

              0100 VBS\n

              1000 HP\n

              1001 HP/XP (Orbits)\n

              1002 HP/G2 (Orbits)\n
              
              1008 XP (GPS)\n
              
              1012 G2 (GPS)\n
              
              1013 G2 (GPS/GLONASS)\n
              
              1014 G2 (GLONASS)\n
              
              1016 HP/XP (GPS)\n
              
              1020 HP/G2 (GPS)\n
              
              1021 HP/G2 (GPS/GLONASS)"
      - sentence: HDT
        description: Heading - True
        fields:
          # 1
          - name: heading
            type: float32
            note: "Heading, degrees True"
          # 2
          - name: "true"
            type: string
            note: "T = True"
      - sentence: ZDA
        description: Time & Date - UTC, day, month, year and local time zone
        fields:
          # 1
          - name: utc_time
            type: string
            note: "UTC time (hours, minutes, seconds, may have fractional subseconds)"
          # 2
          - name: day
            type: int8
            note: "Day, 01 to 31"
          # 3
          - name: month
            type: int8
            note: "Month, 01 to 12"
          # 4
          - name: year
            type: int16
            note: "Year (4 digits)"
          # 5
          - name: local_zone_hours
            type: int8
            note: "Local zone description, 00 to +- 13 hours"
          # 6
          - name: local_zone_minutes
            type: int8
            note: "Local zone minutes description, 00 to 59, apply same sign as local hours"


  # Propietary GYROCOMPAS1
  - protocol: GYROCOMPAS1
    standard: false
    sentences:
      - sentence: HEHDT
        fields:
          - name: heading
            type: float
            units: deg
          - name: symbol
            type: string
      - sentence: PHTRO
        fields:
          - name: pitch
            type: float
            units: deg
          - name: pitch_direction
            type: string
            note: M bow up, P bow down
          - name: roll
            type: float
            units: deg
          - name: roll_direction
            type: string
            note: M bow up, P bow down
      - sentence: PHINF
        fields:
          - name: status
            type: string
```

### Protocol (JS) Object

It is an object which has the next type.

```typescript
type Protocol = {
  // Protocol name
  protocol: string,
  // Semantic version
  version?: string,
  // If the protocol is NMEA stantard or propietary (false by default)
  standard?: boolean = false,
  // Array of sentences
  sentences: Array<{
    // Sentence ID
    sentence: string,
    // Each field metadata
    fields: Array<{
      name: string,
      type: 'string' | 'boolean' | 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64',
      units?: string,
      note?: string,
    }>
    // Optional description
    description?: string
  }>
}
```

## API

- Get parsed data

    ```typescript
    // NMEA ascii string with multiple sentences
    const input = '$GPGGA,...\r\n$GPAAM,...\r\n'
    const output: NMEASentence[] = parser.parseData(input)
    ```

- Feed the parser (add more sentences)

    ```typescript
    let output: NMEASentence[]
    // From YAML file path
    const YAML_FILE: string = './my_yaml_file.yaml'
    output = parser.addProtocols({ file: YAML_FILE })
    // From YAML file content
    const YAML_CONTENT: string = fs.readFileSync(YAML_FILE, 'utf8')
    output = parser.addProtocols({ content: YAML_CONTENT })
    // From Protocol object
    const PROTOCOL_OBJECT: Protocol[] = [{...}, {...}, ..., {...}]
    output = parser.addProtocols({ content: PROTOCOL_OBJECT })
    ```

- Get known protocols with their sentences

    ```typescript
    type ProtocolOutput = {
      protocol: string,
      version?: string,
      sentences: string[]
    }

    // GET protocols
    const knownProtocols: ProtocolOutput[] = parser.getProtocols()
    ```

- Get sentence info by id

    ```typescript
    type Sentence = {
      // ID of the sentence
      sentence: string,
      // Protocol info
      protocol: {
        name: string,
        standard: boolean,
        version?: string
      },
      // Ordered fields with its info
      fields: Array<{
        name: string,
        type: 'string' | 'boolean' | 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64',
        units?: string,
        note?: string
      }>,
      // Optional talker
      talker?: null | { id: string, description: string }
      // Optional description
      description?: string
    }

    // GET sentence
    const id = 'AAM'
    const sentenceInfo: null | Sentence = parser.getSentence(id)
    ```

- Get / set memory and / or buffer character length

    ```typescript
    // Get
    const memory = parser.memory
    const charactersLimit = parser.bufferLimit
    // Set
    parser.memory = !memory
    parser.bufferLimit = charactersLimit + 10
    ```

## Notes

`bufferLimit` it is used to stored an incompleted frame if `memory` is enabled. So you can add the needed it data later.

`bufferLimit` is set to `1024` characters which is more than enough to store an incompleted frame.

> NMEA standard fix the max lenght of a frame to 82 characters (flags included)

It is not recommended you change its value if you don't understand well the NMEA protocol pr how it works.
