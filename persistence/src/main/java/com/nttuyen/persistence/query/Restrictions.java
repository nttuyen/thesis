/**
 * 
 */
package com.nttuyen.persistence.query;

import java.util.ArrayList;
import java.util.List;

/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class Restrictions {
	
	public static Restriction equal(String field, Object val) {
		return new OperationRestriction(field, "=", val);
	}
	
	public static Restriction greater(String field, Object val) {
		return new OperationRestriction(field, ">", val);
	}
	
	public static Restriction greaterOrEqual(String field, Object val) {
		return new OperationRestriction(field, ">=", val);
	}
	
	public static Restriction lesser(String field, Object val) {
		return new OperationRestriction(field, "<", val);
	}
	
	public static Restriction lesserOrEqual(String field, Object val) {
		return new OperationRestriction(field, "<=", val);
	} 
	
	public static Restriction like(String field, String expression) {
		return new OperationRestriction(field, "LIKE", expression);
	}
	
	public static Restriction in(String field, Object... vals) {
		return new OperationRestriction(field, "IN", vals);
	}
	
	public static Restriction between(String field, Object val1, Object val2) {
		return new OperationRestriction(field, "BETWEEN", val1, val2);
	}
	
	public static Restriction isNull(String field) {
		return new OperationRestriction(field, "IS NULL");
	}
	
	public static Restriction isNotNull(String field) {
		return new OperationRestriction(field, "IS NOT NULL");
	}
	
	public static Restriction and(Restriction... restrictions) {
		return new ComplexRestriction("AND", restrictions);
	}
	
	public static Restriction or(Restriction...restrictions) {
		return new ComplexRestriction("OR", restrictions);
	}
	
	public static Restriction order(String field, String type) {
		return new OrderRestriction(field, type);
	}
	
	private static class ComplexRestriction implements Restriction {

		private final String sql;
		private final Object[] objs;
		public ComplexRestriction(String type, Restriction...restrictions) {
			if(restrictions != null) {
				List<Object> objects = new ArrayList<Object>();
				StringBuilder sb = new StringBuilder();
				boolean first = true;
				for(Restriction restriction : restrictions) {
					if(restriction != null) {
						if(!first) {
							sb.append(" ");
							sb.append(type);
							sb.append(" ");
						} else {
							first = false;
						}
						sb.append("(");
						sb.append(restriction.sql());
						sb.append(")");
						for(Object obj : restriction.values()) {
							objects.add(obj);
						}
					}
				}
				this.sql = sb.toString();
				this.objs = objects.toArray();
			} else {
				this.sql = "";
				this.objs = new Object[0];
			}
		}
		
		public String sql() {
			return this.sql;
		}

		public String type() {
			return Restriction.WHERE;
		}

		public Object[] values() {
			return this.objs;
		}
	}
	
	private static class OrderRestriction implements Restriction {
		private final String sql;

		public OrderRestriction(String field, String type) {
			StringBuilder sb = new StringBuilder();
			sb.append("{").append(field).append("}").append(" ").append(type);
			this.sql = sb.toString();
		}
		
		public String sql() {
			return this.sql;
		}

		public String type() {
			return Restriction.ORDER;
		}

		public Object[] values() {
			return new Object[0];
		}
		
	}
	
	private static class OperationRestriction implements Restriction {

		private final String sql;
		private final Object[] obj;
		
		public OperationRestriction(String field, String operation, Object... objs) {
			StringBuilder sb = new StringBuilder();
			sb.append("({");
			sb.append(field);
			sb.append("} ");
			sb.append(operation);
			sb.append(" ");
			if(objs != null) {
				boolean first = true;
				for(int i = 0; i < objs.length; i++) {
					if(first) {
						sb.append("(?");
						first = false;
					} else {
						sb.append(", ?");
					}
				}
				if(!first) {
					sb.append(")");
				}
				this.obj = objs;
			} else {
				this.obj = new Object[0];
			}
			sb.append(")");
			this.sql = sb.toString();
		}
		
		public String sql() {
			return this.sql;
		}

		public String type() {
			return Restriction.WHERE;
		}

		public Object[] values() {
			return this.obj;
		}
		
	}
}
