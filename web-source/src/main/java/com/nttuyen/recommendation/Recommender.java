/**
 * 
 */
package com.nttuyen.recommendation;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

import org.apache.log4j.Logger;
import com.nttuyen.persistence.query.QueryUtil;
import com.nttuyen.persistence.jdbc.Connector;
import com.nttuyen.persistence.jdbc.ConnectorFactory;
import com.nttuyen.web.core.SystemLoader;


/**
 * @author nttuyen
 *
 */
public class Recommender {
	private static final Logger log = Logger.getLogger(Recommender.class);

	private static final Properties cfg = SystemLoader.systemConfig();
    private static final Connector connector = ConnectorFactory.createConnector(cfg);
	private final static String sql = QueryUtil.processQuery(cfg.getProperty("predict.query.select"), cfg);
	
	public static float predictRate(long userId, long itemId) {
		float predict = 0;
		try {
			Connection connection = connector.getConnection();
			PreparedStatement stm = connection.prepareStatement(sql);
			stm.setLong(1, userId);
			stm.setLong(2, itemId);
			ResultSet rs = stm.executeQuery();
			if(rs.next()) {
				predict = rs.getFloat(1);
			}
			rs.close();
			stm.close();
			connection.close();
		} catch (SQLException e) {
			log.error("SQL Exception", e);
			predict = 0;
		}
		if(predict < 3) {
			predict = 0;
		} else if(predict < 3.5) {
			predict = 3;
		} else if(predict < 4){
			predict = 3.5f;
		} else if(predict < 4.5){
			predict = 4;
		} else if(predict < 5){
			predict = 4.5f;
		} else {
			predict = 5;
		}
		return predict;
	}
}
