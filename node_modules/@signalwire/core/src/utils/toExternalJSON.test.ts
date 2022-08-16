import { toExternalJSON } from './toExternalJSON'

describe('toExternalJSON', () => {
  it('converts all the keys from snake_case to camelCase', async () => {
    const input = {
      snake_case: 'test',
      another_prop: null,
      some_other_property: {
        nested_property: {
          nested_prop_2: 'nested prop value',
        },
        prop_2: 'test',
      },
    }

    const output = {
      snakeCase: 'test',
      anotherProp: null,
      someOtherProperty: {
        nestedProperty: {
          nestedProp2: 'nested prop value',
        },
        prop2: 'test',
      },
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })

  it('converts the values from `updated` keys to be camelCase', () => {
    const input = {
      updated: ['camel_case_prop_1', 'camel_case_prop_2', 'camel_case_prop_3'],
    }

    const output = {
      updated: ['camelCaseProp1', 'camelCaseProp2', 'camelCaseProp3'],
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })

  it('converts values for any specified property in `options.propsToUpdateValue`', () => {
    const input = {
      updated_two: [
        'camel_case_prop_1',
        'camel_case_prop_2',
        'camel_case_prop_3',
      ],
    }

    const output = {
      updatedTwo: ['camelCaseProp1', 'camelCaseProp2', 'camelCaseProp3'],
    }

    expect(
      toExternalJSON(input, {
        propsToUpdateValue: ['updated_two'],
      })
    ).toStrictEqual(output)
  })

  it('converts the layout `layers` key to be camelCase', () => {
    const input = {
      layers: [
        {
          y: 25,
          x: 0,
          layer_index: 0,
          height: 50,
          z_index: 0,
          reservation: 'focus-1',
          width: 50,
        },
        {
          y: 25,
          x: 50,
          layer_index: 1,
          height: 50,
          z_index: 1,
          reservation: 'focus-2',
          width: 50,
        },
      ],
      room_session_id: '688d9de2-09ac-4dd9-89c6-59e44fa9cd44',
      room_id: '24c86438-8cd7-4315-9cf4-e3ac0b8cb588',
      name: '2x1',
    }

    const output = {
      layers: [
        {
          y: 25,
          x: 0,
          layerIndex: 0,
          height: 50,
          zIndex: 0,
          reservation: 'focus-1',
          width: 50,
        },
        {
          y: 25,
          x: 50,
          layerIndex: 1,
          height: 50,
          zIndex: 1,
          reservation: 'focus-2',
          width: 50,
        },
      ],
      roomSessionId: '688d9de2-09ac-4dd9-89c6-59e44fa9cd44',
      roomId: '24c86438-8cd7-4315-9cf4-e3ac0b8cb588',
      name: '2x1',
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })

  it('converts timestamp properties to Date objects', () => {
    const input = {
      started_at: 1632305086964 / 1000,
      ended_at: 1632305100130 / 1000,
      completed_at: 'an invalid date',
      started: 1632305086964 / 1000,
      ended: 1632305100130 / 1000,
      prop_one: 'one',
      prop_two: 'two',
      prop_three: 1,
    }

    const output = {
      startedAt: new Date(1632305086964),
      endedAt: new Date(1632305100130),
      completedAt: 'an invalid date',
      started: 1632305086964 / 1000,
      ended: 1632305100130 / 1000,
      propOne: 'one',
      propTwo: 'two',
      propThree: 1,
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })

  it('converts nested key like members and recordings', () => {
    const id = '5074e94f-de6e-4477-8068-f046cab81f77'
    const roomId = '297ec3bb-fdc5-4995-ae75-c40a43c272ee'
    const input = JSON.parse(
      `{"recording":false,"name":"test","hide_video_muted":false,"id":"${id}","members":[{"visible":false,"room_session_id":"${id}","input_volume":0,"id":"b3b0cfd6-2382-4ac6-a8c9-9182584697ae","input_sensitivity":44,"audio_muted":false,"output_volume":0,"name":"user","deaf":false,"video_muted":false,"room_id":"${roomId}","type":"member"}],"recordings":[{"id":"rec1","state":"recording","started_at":1633340944.785},{"id":"rec2","state":"completed","started_at":1633340944.785,"ended_at":1633340976.802}],"room_id":"${roomId}","event_channel":"room.uuid"}`
    )

    const output = {
      id,
      roomId,
      eventChannel: 'room.uuid',
      recording: false,
      name: 'test',
      hideVideoMuted: false,
      members: [
        {
          id: 'b3b0cfd6-2382-4ac6-a8c9-9182584697ae',
          roomSessionId: id,
          roomId,
          type: 'member',
          name: 'user',
          visible: false,
          audioMuted: false,
          videoMuted: false,
          deaf: false,
          outputVolume: 0,
          inputVolume: 0,
          inputSensitivity: 44,
        },
      ],
      recordings: [
        {
          id: 'rec1',
          state: 'recording',
          startedAt: new Date(1633340944.785 * 1000),
        },
        {
          id: 'rec2',
          state: 'completed',
          startedAt: new Date(1633340944.785 * 1000),
          endedAt: new Date(1633340976.802 * 1000),
        },
      ],
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })

  it('should not change keys already camelCase-d', async () => {
    const input = {
      someId: 'test',
      anotherProp: null,
      this_change: null,
      someOtherProperty: {
        nested_property: {
          nestedProp2: 'nested prop value',
        },
        firstLevel: 'test',
      },
    }

    const output = {
      someId: 'test',
      anotherProp: null,
      thisChange: null,
      someOtherProperty: {
        nestedProperty: {
          nestedProp2: 'nested prop value',
        },
        firstLevel: 'test',
      },
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })

  it('should not change values within array not in the whitelist', async () => {
    const input = {
      updated: ['key_one', 'key_two'],
      unknown_list: ['value_one', 'value_two'],
      this_change: null,
      nested_property: {
        nested_array: ['other_test'],
      },
    }

    const output = {
      updated: ['keyOne', 'keyTwo'],
      unknownList: ['value_one', 'value_two'],
      thisChange: null,
      nestedProperty: {
        nestedArray: ['other_test'],
      },
    }

    expect(toExternalJSON(input)).toStrictEqual(output)
  })
})
