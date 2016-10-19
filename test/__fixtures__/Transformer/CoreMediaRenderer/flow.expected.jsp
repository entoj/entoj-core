<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<c:if test="${ model.copy or model.headline == '' }">COPY</c:if>
<c:forEach var="item" items="${ model.items }">COPY</c:forEach>
