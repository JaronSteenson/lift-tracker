#
# Copy createdb.sql.example to createdb.sql
# then uncomment set database name and username to create you need databases
#
# example: .env MYSQL_USER=appuser and needed db name is myshop_db
#
#    CREATE DATABASE IF NOT EXISTS `myshop_db` ;
#    GRANT ALL ON `myshop_db`.* TO 'appuser'@'%' ;
#
#
# this sql script will auto run when the mysql container starts and the $DATA_PATH_HOST/mysql not found.
#
# if your $DATA_PATH_HOST/mysql exists and you do not want to delete it, you can run by manual execution:
#
#     docker-compose exec mysql bash
#     mysql -u root -p < /docker-entrypoint-initdb.d/createdb.sql
#
DROP DATABASE IF EXISTS lift_tracker_api;
DROP DATABASE IF EXISTS lift_tracker_api_test;

CREATE USER IF NOT EXISTS lift_tracker_api;
CREATE USER IF NOT EXISTS lift_tracker_api_test;
CREATE DATABASE IF NOT EXISTS lift_tracker_api;
CREATE DATABASE IF NOT EXISTS lift_tracker_api_test;

GRANT ALL PRIVILEGES ON *.* TO 'lift_tracker_api'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON lift_tracker_api_test.* TO 'lift_tracker_api_test'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- So php can use mysql 8
ALTER USER 'lift_tracker_api' IDENTIFIED WITH mysql_native_password BY 'lift_tracker_api';
ALTER USER 'lift_tracker_api_test' IDENTIFIED WITH mysql_native_password BY 'lift_tracker_api_test';
