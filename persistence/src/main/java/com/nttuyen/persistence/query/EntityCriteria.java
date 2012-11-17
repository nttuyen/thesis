/**
 * 
 */
package com.nttuyen.persistence.query;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class EntityCriteria implements Criteria{
	private final List<Restriction> where = new LinkedList<Restriction>();
	private final List<Restriction> order = new LinkedList<Restriction>();
	private final List<Restriction> having = new LinkedList<Restriction>();
	private final List<Restriction> groupBy = new LinkedList<Restriction>();
	private long start;
	private int max;
	private final List<Class<?>> classes = new LinkedList<Class<?>>();
	private final StringBuilder froms = new StringBuilder();
	
	private final List<Object> params = new LinkedList<Object>();
	
	private String sql = "";
	private ResultSet rs = null;
	private boolean change = true;
	
	private final Connection connection;
	
	public EntityCriteria(Connection connection) {
		this.connection = connection;
	}
	
	public Criteria add(Restriction restriction) {
		this.change = true;
		if(Restriction.WHERE.equals(restriction.type())) {
			where.add(restriction);
			return this;
		}
		
		if(Restriction.ORDER.equals(restriction.type())) {
			where.add(restriction);
			return this;
		}
		
		if(Restriction.HAVING.equals(restriction.type())) {
			where.add(restriction);
			return this;
		}
		
		if(Restriction.GROUP_BY.equals(restriction.type())) {
			where.add(restriction);
			return this;
		}
		return this;
	}
	
	public Criteria addEntity(Class<?>... c) {
		this.change = true;
		Pattern p = Pattern.compile("\\.");
		for(Class<?> cl : c) {
			if(froms.length() > 0) {
				froms.append(", ");
			}
			String className = cl.getName();
			String[] names = p.split(className);
			froms.append("{");
			froms.append(names[names.length - 1]);
			froms.append("}");
			classes.add(cl);
		}
		return this;
	}
	
	public Criteria joinEntity(Class<?> c, String type, String field1, String field2) {
		this.change = true;
		if(froms.length() == 0) {
			this.addEntity(c);
			return this;
		}
		froms.append(" ");
		froms.append(type);
		froms.append(" ");
		Pattern p = Pattern.compile("\\.");
		String className = c.getName();
		String[] names = p.split(className);
		froms.append("{");
		froms.append(names[names.length - 1]);
		froms.append("}");
		froms.append(" ON ");
		froms.append("{");
		froms.append(field1);
		froms.append("}");
		froms.append(" = ");
		froms.append("{");
		froms.append(field2);
		froms.append("}");
		this.classes.add(c);
		return this;
	}
	
	public Criteria limit(long start, int max) {
		this.change = true;
		this.start = start;
		this.max = max;
		return this;
	}
	
	@SuppressWarnings("unchecked")
	public <T> List<T> list() {
		if(classes.size() == 0) {
			return null;
		}
		if(!change && rs != null) {
			return ResultUtil.fetch(rs, (Class<T>)classes.get(0));
		}
		this.toSql();
		
		try {
			PreparedStatement stm = connection.prepareStatement(this.sql);
			int num = 0;
			for(Object obj : this.params) {
				num++;
				if(String.class.equals(obj.getClass())) {
					stm.setString(num, (String)obj);
				} else if(Byte.class.equals(obj.getClass())) {
					stm.setByte(num, (Byte)obj);
				} else if(Integer.class.equals(obj.getClass())) {
					stm.setInt(num, (Integer)obj);
				} else if(Short.class.equals(obj.getClass())) {
					stm.setShort(num, (Short)obj);
				} else if(Long.class.equals(obj.getClass())) {
					stm.setLong(num, (Long)obj);
				} else if(Float.class.equals(obj.getClass())) {
					stm.setFloat(num, (Float)obj);
				} else if(Double.class.equals(obj.getClass())) {
					stm.setDouble(num, (Double)obj);
				} else if(Boolean.class.equals(obj.getClass())){
					stm.setBoolean(num, (Boolean)obj);
				} else if (Date.class.equals(obj.getClass())) {
					stm.setDate(num, new java.sql.Date(((Date)obj).getTime()));
				}else {
					stm.setObject(num, obj);
				}
			}
			System.out.println(stm.toString());
			this.rs = stm.executeQuery();
			return ResultUtil.fetch(rs, (Class<T>)classes.get(0));
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	public <T> List<T> list(Class<T> c) {
		if(classes.size() == 0) {
			return null;
		}
		if(!change && rs != null) {
			return ResultUtil.fetch(rs, c);
		}
		this.toSql();
		
		try {
			PreparedStatement stm = connection.prepareStatement(this.sql);
			int num = 0;
			for(Object obj : this.params) {
				num++;
				if(String.class.equals(obj.getClass())) {
					stm.setString(num, (String)obj);
				} else if(Byte.class.equals(obj.getClass())) {
					stm.setByte(num, (Byte)obj);
				} else if(Integer.class.equals(obj.getClass())) {
					stm.setInt(num, (Integer)obj);
				} else if(Short.class.equals(obj.getClass())) {
					stm.setShort(num, (Short)obj);
				} else if(Long.class.equals(obj.getClass())) {
					stm.setLong(num, (Long)obj);
				} else if(Float.class.equals(obj.getClass())) {
					stm.setFloat(num, (Float)obj);
				} else if(Double.class.equals(obj.getClass())) {
					stm.setDouble(num, (Double)obj);
				} else if(Boolean.class.equals(obj.getClass())){
					stm.setBoolean(num, (Boolean)obj);
				} else if (Date.class.equals(obj.getClass())) {
					stm.setDate(num, new java.sql.Date(((Date)obj).getTime()));
				}else {
					stm.setObject(num, obj);
				}
			}
			this.rs = stm.executeQuery();
			return ResultUtil.fetch(rs, c);
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	private String toSql() {
		if(!change && !"".equals(sql)) {
			return sql;
		}
		StringBuilder query = new StringBuilder();
		query.append("SELECT * FROM ");
		query.append(froms);
		String where = where();
		if(!"".equals(where)) {
			query.append(" WHERE ");
			query.append(where);
		}
		
		String order = orderBy();
		if(!"".equals(order)) {
			query.append(" ORDER BY ");
			query.append(order);
		}
		
		String having = having();
		if(!"".equals(having)) {
			//TODO: process Having
		}
		
		String group = groupBy();
		if(!"".equals(group)) {
			//TODO: process GROUP BY
		}
		
		if(max > 0) {
			query.append(" LIMIT ");
			if(start > 0) {
				query.append(start);
				query.append(", ");
			}
			query.append(max);
		}
		
		this.sql = QueryUtil.processQuery(query.toString(), (Class<?>[])classes.toArray(new Class<?>[0]));
		this.change = false;
		return this.sql;
	}
	private String where() {
		StringBuilder wheres = new StringBuilder();
		boolean first = true;
		for(Restriction restriction : where) {
			if(!first) {
				wheres.append(" AND ");
			} else {
				first = false;
			}
			wheres.append("(");
			wheres.append(restriction.sql());
			wheres.append(")");
			for(Object obj : restriction.values()) {
				params.add(obj);
			}
		}
		return wheres.toString();
	}
	private String orderBy() {
		StringBuilder orders = new StringBuilder();
		for(Restriction restriction : order) {
			orders.append(restriction.sql());
		}
		return orders.toString();
	}
	private String having() {
		StringBuilder havings = new StringBuilder();
		for(Restriction restriction : having) {
			havings.append(restriction.sql());
		}
		return havings.toString();
	}
	private String groupBy() {
		StringBuilder groups = new StringBuilder();
		for(Restriction restriction : groupBy) {
			groups.append(restriction.sql());
		}
		return groups.toString();
	}
	
	protected void finalize() {
		try {
			this.connection.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
