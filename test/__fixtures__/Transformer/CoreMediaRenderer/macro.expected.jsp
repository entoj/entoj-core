<!-- Macro macro -->
<c:if test="${ empty classes }">
  <c:set var="classes" value="${ 'foo' }" />
</c:if>

    <cm:include self="${ self }"/>
<!-- /Macro macro -->

