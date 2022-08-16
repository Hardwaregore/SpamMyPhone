import { DeviceBuilder } from './DeviceBuilder'

describe('DeviceBuilder', () => {
  it('should build a list of devices to dial', () => {
    const dialer = new DeviceBuilder()

    dialer
      .add(DeviceBuilder.Phone({ from: '+1', to: '+2', timeout: 30 }))
      .add(
        DeviceBuilder.Sip({
          from: 'sip:one',
          to: 'sip:two',
          headers: [{ name: 'foo', value: 'bar' }],
        })
      )
      .add([
        DeviceBuilder.Phone({ from: '+3', to: '+4' }),
        DeviceBuilder.Sip({
          from: 'sip:three',
          to: 'sip:four',
          headers: [{ name: 'baz', value: 'qux' }],
        }),
        DeviceBuilder.Phone({ from: '+5', to: '+6' }),
      ])

    expect(dialer.devices).toStrictEqual([
      [
        {
          type: 'phone',
          from: '+1',
          to: '+2',
          timeout: 30,
        },
      ],
      [
        {
          type: 'sip',
          from: 'sip:one',
          to: 'sip:two',
          headers: [{ name: 'foo', value: 'bar' }],
        },
      ],
      [
        {
          type: 'phone',
          from: '+3',
          to: '+4',
        },
        {
          type: 'sip',
          from: 'sip:three',
          to: 'sip:four',
          headers: [{ name: 'baz', value: 'qux' }],
        },
        {
          type: 'phone',
          from: '+5',
          to: '+6',
        },
      ],
    ])
  })
})
