/**
 * 
 */
package com.nttuyen.thesis.util;

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
public class RateUtil {
private static final Logger log = Logger.getLogger(RateUtil.class);

	private static final Properties cfg = SystemLoader.systemConfig();
    private static final Connector connector = ConnectorFactory.createConnector(cfg);
	private final static String sql = QueryUtil.processQuery(cfg.getProperty("rating.query.select"), cfg);
	
	public static byte getRate(long userId, long musicId) {
		byte rate = 0;
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(sql);
			stm.setLong(1, userId);
			stm.setLong(2, musicId);
			ResultSet rs = stm.executeQuery();
			if(rs.next()) {
				rate = (byte)rs.getInt(1);
			}
			rs.close();
			stm.close();
			connection.close();
		} catch (SQLException e) {
			log.error("SQL Exception", e);
			rate = 0;
		}
		return rate;
	}
}
