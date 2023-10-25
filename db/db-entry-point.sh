#!/bin/bash
set -m

# Start mongod in the background
mongod --replSet rs0 --bind_ip_all &

# Wait for MongoDB to accept connections
echo "Waiting for MongoDB to start..."
until mongosh --quiet --eval "db.serverStatus()" &> /dev/null; do
	echo -n "."
	sleep 1
done
echo "MongoDB started."

# Initialize the replica set, if the replica set is not already initiated
# Code 94: https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.yml
if [ "$(mongosh --quiet --eval 'try { rs.status().ok } catch (e) { e.code }')" == "94" ]; then
	echo "Initiating replica set"
	mongosh --eval "rs.initiate()"
else
	echo "Replica set already initiated"
fi

# Bring mongod process back to the foreground
fg %1
