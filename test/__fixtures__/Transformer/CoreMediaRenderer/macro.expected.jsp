<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<!-- Macro macro -->
<c:if test="${ empty classes }">
  <c:set var="classes" value="${ 'foo' }" />
</c:if>

    <cm:include view="macro"></cm:include>
    <cm:include self="${ self }"/>
<!-- /Macro macro -->
