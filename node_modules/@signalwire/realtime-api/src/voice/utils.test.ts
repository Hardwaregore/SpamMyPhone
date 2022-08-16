import { toInternalDevices } from './utils'

describe('toInternalDevices', () => {
  it('should convert the user facing interface to the internal one', () => {
    expect(
      toInternalDevices([
        [
          {
            type: 'phone',
            to: '+12083660792',
            from: '+15183601338',
            timeout: 30,
          },
        ],
      ])
    ).toEqual([
      [
        {
          type: 'phone',
          params: {
            to_number: '+12083660792',
            from_number: '+15183601338',
            timeout: 30,
          },
        },
      ],
    ])

    expect(
      toInternalDevices([
        {
          type: 'phone',
          to: '+12083660792',
          from: '+15183601338',
        },
        [
          {
            type: 'sip',
            to: '+12083660791',
            from: '+15183601331',
            timeout: 30,
          },
          {
            type: 'phone',
            to: '+12083660793',
            from: '+15183601138',
          },
        ],
        [
          {
            type: 'phone',
            to: '+12083660793',
            from: '+15183601138',
          },
          {
            type: 'phone',
            to: '+12083660793',
            from: '+15183601138',
          },
          {
            type: 'phone',
            to: '+12083660793',
            from: '+15183601138',
          },
        ],
        {
          type: 'phone',
          to: '+12083660793',
          from: '+15183601138',
        },
      ])
    ).toEqual([
      {
        type: 'phone',
        params: {
          to_number: '+12083660792',
          from_number: '+15183601338',
        },
      },
      [
        {
          type: 'sip',
          params: {
            to: '+12083660791',
            from: '+15183601331',
            timeout: 30,
          },
        },
        {
          type: 'phone',
          params: {
            to_number: '+12083660793',
            from_number: '+15183601138',
          },
        },
      ],
      [
        {
          type: 'phone',
          params: {
            to_number: '+12083660793',
            from_number: '+15183601138',
          },
        },
        {
          type: 'phone',
          params: {
            to_number: '+12083660793',
            from_number: '+15183601138',
          },
        },
        {
          type: 'phone',
          params: {
            to_number: '+12083660793',
            from_number: '+15183601138',
          },
        },
      ],
      {
        type: 'phone',
        params: {
          to_number: '+12083660793',
          from_number: '+15183601138',
        },
      },
    ])
  })
})
