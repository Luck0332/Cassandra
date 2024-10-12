const { Client } = require('cassandra-driver');

const client = new Client({
    contactPoints: ['127.0.0.1:9042'], // Use Docker host IP or localhost
    localDataCenter: 'datacenter1' ,     // Change if needed
    keyspace: 'my_keyspace'
})
const query = `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name TEXT,
        email TEXT,
        age TEXT
    )
`;

client.execute(`DROP TABLE IF EXISTS users`, (err) => {
    if (err) {
        console.error('Error dropping table:', err);
        return;
    }

    client.execute(query, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }

        console.log('Table created successfully!');

        client.shutdown();
    });
});