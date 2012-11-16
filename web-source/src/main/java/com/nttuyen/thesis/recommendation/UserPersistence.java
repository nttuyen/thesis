/**
 * 
 */
package com.nttuyen.thesis.recommendation;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;
import org.apache.log4j.Logger;
import com.nttuyen.dao.query.QueryUtil;
import com.nttuyen.dao.jdbc.Connector;
import com.nttuyen.dao.jdbc.ConnectorFactory;
import com.nttuyen.web.core.SystemLoader;

/**
 * @author nttuyen
 *
 */
public class UserPersistence {
    private static final Properties cfg = SystemLoader.systemConfig();
	private static final Connector connector = ConnectorFactory.createConnector(cfg);
	private static final Logger log = Logger.getLogger(UserPersistence.class);
	
	public static long login(String userName, String password) {
		if(userName == null || password == null || "".equals(userName) || "".equals(password)) {
			return 0;
		}
		String sql = "SELECT {user.id}, {user.password} FROM {user.table} WHERE {user.username} = ?";
		sql = QueryUtil.processQuery(sql, cfg);
		long result = 0;
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(sql);
			stm.setString(1, userName);
			log.info("Query: " + stm.toString());
			ResultSet rs = stm.executeQuery();
			if(rs.next()) {
				String pass = rs.getString(cfg.getProperty("user.password"));
				if(password.equals(pass)) {
					result = rs.getLong(cfg.getProperty("user.id"));
				}
			}
			rs.close();
			stm.close();
			connection.close();
		} catch (SQLException e) {
			log.error("SQL Exception", e);
			result = 0;
		}
		return result;
	}
	
	public static boolean checkUserNameExists(String userName) {
		boolean result = false;
		try {
			Connection connection = connector.getConnection();
			String sql = "SELECT {user.id} FROM {user.table} WHERE {user.username} = ?";
			sql = QueryUtil.processQuery(sql, cfg);
			PreparedStatement stm = connection.prepareStatement(sql);
			stm.setString(1, userName);
			ResultSet rs = stm.executeQuery();
			if(rs.next()) {
				result = true;
			}
			rs.close();
			stm.close();
			connection.close();
		} catch (SQLException e) {
			log.error("SQL Exception", e);
			return true;
		}
		return result;
	}
}
