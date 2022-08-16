#!/usr/bin/env python3

# Reads the api key from a file and returns it

api = open(r"api_key", "r")
key = api.read()
api.close()

print(key)